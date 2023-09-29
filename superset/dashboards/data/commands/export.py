import tempfile
from typing import NamedTuple, Optional

from pdf2docx import parse as parse_pdf_to_doc
from superset.commands.base import BaseCommand
from superset.daos.dashboard import DashboardDAO
from superset.dashboards.commands.exceptions import DashboardNotFoundError
from superset.dashboards.data.commands.exceptions import PDFGenerationFailedError
from superset.models.dashboard import Dashboard
from superset.tasks.utils import get_current_user
from superset.utils.screenshots import PDFDashboardScreenshot
from superset.utils.urls import get_url_path


class ExportedFile(NamedTuple):
    name: str
    content: bytes


class PDFExportCommand(BaseCommand):
    def __init__(self, model_id: int, landscape: bool):
        self._model_id = model_id
        self.landscape = landscape
        self._model: Optional[Dashboard] = None

    def run(self) -> ExportedFile:
        self.validate()
        assert self._model

        dashboard_url = get_url_path(
            "Superset.dashboard", dashboard_id_or_slug=self._model.id
        )
        screenshot = PDFDashboardScreenshot(
            dashboard_url,
            self.landscape,
            self._model.digest,
        )
        current_user = get_current_user()
        try:
            document = screenshot.get_screenshot(user=current_user)
        except Exception as exc:
            raise PDFGenerationFailedError() from exc
        return ExportedFile(name=self._model.dashboard_title, content=document)

    def validate(self) -> None:
        self._model = DashboardDAO.find_by_id(self._model_id)
        if not self._model:
            raise DashboardNotFoundError()


class DocExportCommand(PDFExportCommand):
    def run(self) -> ExportedFile:
        exported_file = super().run()
        with tempfile.NamedTemporaryFile(suffix=".pdf") as pdf_file:
            pdf_file.write(exported_file.content)
            pdf_file.seek(0)
            with tempfile.NamedTemporaryFile(suffix=".doc") as doc_file:
                parse_pdf_to_doc(pdf_file.name, doc_file.name)
                with open(doc_file.name, mode="rb") as file_content:
                    document_content = file_content.read()
        return ExportedFile(name=exported_file.name, content=document_content)
