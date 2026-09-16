from starlette.requests import Request

from app.core.security import extract_token


def _request(headers: list[tuple[bytes, bytes]]) -> Request:
    return Request(
        {
            "type": "http",
            "asgi": {"version": "3.0"},
            "http_version": "1.1",
            "method": "GET",
            "scheme": "http",
            "path": "/api/auth/me",
            "raw_path": b"/api/auth/me",
            "query_string": b"",
            "headers": headers,
            "client": ("127.0.0.1", 123),
            "server": ("test", 80),
        }
    )


def test_extract_token_from_cookie():
    request = _request([(b"cookie", b"access_token=cookie-token")])
    assert extract_token(request, None) == "cookie-token"


def test_extract_token_prefers_bearer():
    request = _request([(b"cookie", b"access_token=cookie-token")])
    assert extract_token(request, "bearer-token") == "bearer-token"


def test_extract_token_missing():
    request = _request([])
    assert extract_token(request, None) is None
