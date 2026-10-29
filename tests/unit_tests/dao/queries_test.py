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
from datetime import datetime, timedelta
from typing import Any

import pytest
from pytest_mock import MockerFixture
from sqlalchemy.orm.session import Session

from superset.exceptions import QueryNotFoundException, SupersetCancelQueryException


def test_query_dao_save_metadata(session: Session) -> None:
    from superset import db
    from superset.models.core import Database
    from superset.models.sql_lab import Query

    engine = db.session.get_bind()
    Query.metadata.create_all(engine)  # pylint: disable=no-member

    database = Database(database_name="my_database", sqlalchemy_uri="sqlite://")

    query_obj = Query(
        client_id="foo",
        database=database,
        tab_name="test_tab",
        sql_editor_id="test_editor_id",
        sql="select * from bar",
        select_sql="select * from bar",
        executed_sql="select * from bar",
        limit=100,
        select_as_cta=False,
        rows=100,
        error_message="none",
        results_key="abc",
    )

    db.session.add(database)
    db.session.add(query_obj)

    from superset.daos.query import QueryDAO

    query = db.session.query(Query).one()
    QueryDAO.save_metadata(query=query, payload={"columns": []})
    assert query.extra.get("columns", None) == []


def test_query_dao_get_queries_changed_after(session: Session) -> None:
    from superset import db
    from superset.models.core import Database
    from superset.models.sql_lab import Query

    engine = db.session.get_bind()
    Query.metadata.create_all(engine)  # pylint: disable=no-member

    database = Database(database_name="my_database", sqlalchemy_uri="sqlite://")

    now = datetime.utcnow()

    old_query_obj = Query(
        client_id="foo",
        database=database,
        tab_name="test_tab",
        sql_editor_id="test_editor_id",
        sql="select * from bar",
        select_sql="select * from bar",
        executed_sql="select * from bar",
        limit=100,
        select_as_cta=False,
        rows=100,
        error_message="none",
        results_key="abc",
        changed_on=now - timedelta(days=3),
    )

    updated_query_obj = Query(
        client_id="updated_foo",
        database=database,
        tab_name="test_tab",
        sql_editor_id="test_editor_id",
        sql="select * from foo",
        select_sql="select * from foo",
        executed_sql="select * from foo",
        limit=100,
        select_as_cta=False,
        rows=100,
        error_message="none",
        results_key="abc",
        changed_on=now - timedelta(days=1),
    )

    db.session.add(database)
    db.session.add(old_query_obj)
    db.session.add(updated_query_obj)

    from superset.daos.query import QueryDAO

    timestamp = datetime.timestamp(now - timedelta(days=2)) * 1000
    result = QueryDAO.get_queries_changed_after(timestamp)
    assert len(result) == 1
    assert result[0].client_id == "updated_foo"


def test_query_dao_stop_query_not_found(
    mocker: MockerFixture, app: Any, session: Session
) -> None:
    from superset import db
    from superset.common.db_query_status import QueryStatus
    from superset.models.core import Database
    from superset.models.sql_lab import Query

    engine = db.session.get_bind()
    Query.metadata.create_all(engine)  # pylint: disable=no-member

    database = Database(database_name="my_database", sqlalchemy_uri="sqlite://")

    query_obj = Query(
        client_id="foo",
        database=database,
        tab_name="test_tab",
        sql_editor_id="test_editor_id",
        sql="select * from bar",
        select_sql="select * from bar",
        executed_sql="select * from bar",
        limit=100,
        select_as_cta=False,
        rows=100,
        error_message="none",
        results_key="abc",
        status=QueryStatus.RUNNING,
    )

    db.session.add(database)
    db.session.add(query_obj)

    mocker.patch("superset.sql_lab.cancel_query", return_value=False)

    from superset.daos.query import QueryDAO

    with pytest.raises(QueryNotFoundException):
        QueryDAO.stop_query("foo2")

    query = db.session.query(Query).one()
    assert query.status == QueryStatus.RUNNING


def test_query_dao_stop_query_not_running(
    mocker: MockerFixture, app: Any, session: Session
) -> None:
    from superset import db
    from superset.common.db_query_status import QueryStatus
    from superset.models.core import Database
    from superset.models.sql_lab import Query

    engine = db.session.get_bind()
    Query.metadata.create_all(engine)  # pylint: disable=no-member

    database = Database(database_name="my_database", sqlalchemy_uri="sqlite://")

    query_obj = Query(
        client_id="foo",
        database=database,
        tab_name="test_tab",
        sql_editor_id="test_editor_id",
        sql="select * from bar",
        select_sql="select * from bar",
        executed_sql="select * from bar",
        limit=100,
        select_as_cta=False,
        rows=100,
        error_message="none",
        results_key="abc",
        status=QueryStatus.FAILED,
    )

    db.session.add(database)
    db.session.add(query_obj)

    from superset.daos.query import QueryDAO

    QueryDAO.stop_query(query_obj.client_id)
    query = db.session.query(Query).one()
    assert query.status == QueryStatus.FAILED


def test_query_dao_stop_query_failed(
    mocker: MockerFixture, app: Any, session: Session
) -> None:
    from superset import db
    from superset.common.db_query_status import QueryStatus
    from superset.models.core import Database
    from superset.models.sql_lab import Query

    engine = db.session.get_bind()
    Query.metadata.create_all(engine)  # pylint: disable=no-member

    database = Database(database_name="my_database", sqlalchemy_uri="sqlite://")

    query_obj = Query(
        client_id="foo",
        database=database,
        tab_name="test_tab",
        sql_editor_id="test_editor_id",
        sql="select * from bar",
        select_sql="select * from bar",
        executed_sql="select * from bar",
        limit=100,
        select_as_cta=False,
        rows=100,
        error_message="none",
        results_key="abc",
        status=QueryStatus.RUNNING,
    )

    db.session.add(database)
    db.session.add(query_obj)

    mocker.patch("superset.sql_lab.cancel_query", return_value=False)

    from superset.daos.query import QueryDAO

    with pytest.raises(SupersetCancelQueryException):
        QueryDAO.stop_query(query_obj.client_id)

    query = db.session.query(Query).one()
    assert query.status == QueryStatus.RUNNING


def test_query_dao_stop_query(
    mocker: MockerFixture, app: Any, session: Session
) -> None:
    from superset import db
    from superset.common.db_query_status import QueryStatus
    from superset.models.core import Database
    from superset.models.sql_lab import Query

    engine = db.session.get_bind()
    Query.metadata.create_all(engine)  # pylint: disable=no-member

    database = Database(database_name="my_database", sqlalchemy_uri="sqlite://")

    query_obj = Query(
        client_id="foo",
        database=database,
        tab_name="test_tab",
        sql_editor_id="test_editor_id",
        sql="select * from bar",
        select_sql="select * from bar",
        executed_sql="select * from bar",
        limit=100,
        select_as_cta=False,
        rows=100,
        error_message="none",
        results_key="abc",
        status=QueryStatus.RUNNING,
    )

    db.session.add(database)
    db.session.add(query_obj)

    mocker.patch("superset.sql_lab.cancel_query", return_value=True)

    from superset.daos.query import QueryDAO

    QueryDAO.stop_query(query_obj.client_id)
    query = db.session.query(Query).one()
    assert query.status == QueryStatus.STOPPED


def _add_pending_query() -> Any:
    from superset import db
    from superset.common.db_query_status import QueryStatus
    from superset.models.core import Database
    from superset.models.sql_lab import Query

    engine = db.session.get_bind()
    Query.metadata.create_all(engine)  # pylint: disable=no-member

    database = Database(database_name="my_database", sqlalchemy_uri="sqlite://")
    query_obj = Query(
        client_id="foo",
        database=database,
        tab_name="test_tab",
        sql_editor_id="test_editor_id",
        sql="select * from bar",
        select_sql="select * from bar",
        executed_sql="select * from bar",
        limit=100,
        select_as_cta=False,
        rows=100,
        error_message="none",
        results_key="abc",
        status=QueryStatus.PENDING,
    )
    db.session.add(database)
    db.session.add(query_obj)
    db.session.flush()
    return query_obj


def test_query_dao_stop_query_pending(
    mocker: MockerFixture, app: Any, session: Session
) -> None:
    """
    A query still waiting for a Celery worker has no database-side query to cancel,
    so it is marked as stopped instead of failing.
    """
    from superset import db
    from superset.common.db_query_status import QueryStatus
    from superset.daos.query import QueryDAO
    from superset.models.sql_lab import Query

    query_obj = _add_pending_query()
    cancel_query = mocker.patch("superset.sql_lab.cancel_query", return_value=False)

    QueryDAO.stop_query(query_obj.client_id)

    cancel_query.assert_not_called()
    query = db.session.query(Query).one()
    assert query.status == QueryStatus.STOPPED
    assert query.end_time is not None


def test_query_dao_stop_query_pending_picked_up_by_worker(
    mocker: MockerFixture, app: Any, session: Session
) -> None:
    """
    A query a Celery worker started after it was read as pending is cancelled as a
    running query instead of being marked as stopped while it keeps running.
    """
    from superset import db
    from superset.common.db_query_status import QueryStatus
    from superset.daos.query import QueryDAO
    from superset.models.sql_lab import Query

    query_obj = _add_pending_query()
    # the worker commits RUNNING behind the stale pending object of this session
    db.session.query(Query).filter(Query.id == query_obj.id).update(
        {"status": QueryStatus.RUNNING}, synchronize_session=False
    )
    cancel_query = mocker.patch("superset.sql_lab.cancel_query", return_value=False)

    with pytest.raises(SupersetCancelQueryException):
        QueryDAO.stop_query(query_obj.client_id)

    cancel_query.assert_called_once()
    db.session.expire_all()
    query = db.session.query(Query).one()
    assert query.status == QueryStatus.RUNNING


@pytest.mark.parametrize("status", ["success", "stopped"])
def test_query_dao_stop_query_pending_already_finished(
    mocker: MockerFixture, app: Any, session: Session, status: str
) -> None:
    """
    A query read as pending that has meanwhile finished or been stopped by another
    request is left as is, without a cancel attempt or an error.
    """
    from superset import db
    from superset.common.db_query_status import QueryStatus
    from superset.daos.query import QueryDAO
    from superset.models.sql_lab import Query

    query_obj = _add_pending_query()
    db.session.query(Query).filter(Query.id == query_obj.id).update(
        {"status": QueryStatus(status)}, synchronize_session=False
    )
    cancel_query = mocker.patch("superset.sql_lab.cancel_query")

    QueryDAO.stop_query(query_obj.client_id)

    cancel_query.assert_not_called()
    db.session.expire_all()
    query = db.session.query(Query).one()
    assert query.status == QueryStatus(status)
