import json
import time
import requests

def print_json(response: requests.Response):
    print(response.status_code)
    try:
        json_data = response.json()
        print(json.dumps(json_data, indent=4))
    except json.JSONDecodeError:
        print(response.content.decode("utf8"))
    except Exception as e:
        print(f"Unknown error -> {e}")

session = requests.Session()

login = session.post(
    "http://127.0.0.1:8000/api/v1/login/",
    data=json.dumps({"username": "ethan", "password": "ethan"}),
    headers={
        "Content-Type": "application/json",
    },
)

token = login.json().get("token")

# Use stream=True to get real-time chunks
response = requests.post(
    url="http://127.0.0.1:8000/api/v1/chat/stream/",
    data=json.dumps({
        "model": "llama3.1", 
        "provider": "ollama", 
        "messages": [{"role": "user", "content": "How do I write a simple server in C++?"}]
    }),
    headers={
        "Content-Type": "application/json", 
        "Authorization": f"Token {token}"
    },
    stream=True
)

# Iterate over the response chunks as they arrive
for chunk in response.iter_lines():
    if chunk:
        print(json.loads(chunk)["message"]["content"], end="", flush=True)