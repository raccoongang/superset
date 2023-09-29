from flask_babel import lazy_gettext as _

from superset.commands.exceptions import CommandException


class PDFGenerationFailedError(CommandException):
    message = _("Generation PDF failed for an unknown reason")
