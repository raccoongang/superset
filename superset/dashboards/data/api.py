# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
from __future__ import annotations

import json
import logging
from io import BytesIO
from typing import TYPE_CHECKING

from flask import request, Response
from flask_appbuilder.api import expose, protect
from flask_appbuilder.models.sqla.interface import SQLAInterface
from flask_babel import gettext as _
from werkzeug.wsgi import FileWrapper

from superset.dashboards.api import DashboardRestApi
from superset.dashboards.commands.exceptions import DashboardNotFoundError
from superset.dashboards.data.commands.exceptions import PDFGenerationFailedError
from superset.dashboards.data.commands.export import DocExportCommand, PDFExportCommand
from superset.extensions import event_logger
from superset.models.dashboard import Dashboard
from superset.views.base import generate_download_headers
from superset.views.base_api import statsd_metrics

if TYPE_CHECKING:
    pass

logger = logging.getLogger(__name__)


class DashboardDataRestApi(DashboardRestApi):
    datamodel = SQLAInterface(Dashboard)
    include_route_methods = {"data"}

    @expose("/data", methods=("POST",))
    @protect()
    @statsd_metrics
    @event_logger.log_this_with_context(
        action=lambda self, *args, **kwargs: f"{self.__class__.__name__}.data",
        log_to_statsd=False,
    )
    def data(self) -> Response:
        """
        Takes a query context constructed in the client
        and retutns pdf or msword file.
        ---
        post:
          summary: Create a new pdf or msword dashboard report
          requestBody:
            description: Query context of datasource from which to generate file
            required: true
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/{{self.__class__.__name__}}.post'
          responses:
            200:
              description: Generated report result
              content:
                application/pdf:
                  schema:
                    type: string
                    format: binary
            400:
              $ref: '#/components/responses/400'
            401:
              $ref: '#/components/responses/401'
            500:
              $ref: '#/components/responses/500'
        """
        json_body = None
        if request.is_json:
            json_body = request.json
        elif request.form.get("form_data"):
            try:
                json_body = json.loads(request.form["form_data"])
            except (TypeError, json.JSONDecodeError):
                pass

        if json_body is None:
            return self.response_400(message=_("Request is not JSON"))

        command = self.dispatch_export_command(
            json_body["id"],
            json_body["landscape"],
            json_body["result_format"],
        )

        try:
            exported_file = command.run()  # type: ignore
        except DashboardNotFoundError:
            return self.response_404()
        except PDFGenerationFailedError as exp:
            return self.response_500(message=str(exp))

        return Response(
            FileWrapper(BytesIO(exported_file.content)),
            mimetype=f"application/{json_body['result_format']}",
            direct_passthrough=True,
            headers=generate_download_headers(
                json_body["result_format"],
                exported_file.name,
            ),
        )

    @staticmethod
    def dispatch_export_command(
        dashboard_id: int, landscape: bool, format_type: str
    ) -> PDFExportCommand | None:
        """
        Report generation Command entry point.

        Automatic selection of commands according to the choosen action type.
        """
        return {
            "pdf": lambda: PDFExportCommand(dashboard_id, landscape),
            "docx": lambda: DocExportCommand(dashboard_id, landscape),
        }.get(format_type, lambda: None)()
