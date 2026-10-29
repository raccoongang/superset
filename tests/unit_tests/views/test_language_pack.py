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
"""Tests for the language pack endpoint of superset.views.core"""

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from superset.app import SupersetApp


def test_language_pack_endpoint_is_public(app: "SupersetApp") -> None:
    """The language pack endpoint must be accessible without authentication.

    Translation data is non-sensitive, and the login page, public dashboards and
    embedded dashboards fetch it before the user is authenticated. With
    ``@has_access`` unauthenticated requests were redirected to ``/login/``,
    which left those pages untranslated.
    """
    with app.test_client() as client:
        resp = client.get("/superset/language_pack/uk/")
        # compiled catalogs may be missing in the test environment, so a 404 is
        # acceptable; a 3xx redirect means the endpoint still requires a login
        assert resp.status_code in (200, 404)
        if resp.status_code == 200:
            assert resp.is_json


def test_language_pack_endpoint_rejects_invalid_lang(app: "SupersetApp") -> None:
    """Invalid language codes are rejected with 400."""
    with app.test_client() as client:
        resp = client.get("/superset/language_pack/EN-us/")
        assert resp.status_code == 400
