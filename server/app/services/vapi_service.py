import requests
import os
from typing import Dict

class VapiService:
    def __init__(self):
        self.api_key = os.getenv("VAPI_API_KEY")
        self.phone_number_id = os.getenv("VAPI_PHONE_NUMBER_ID")
        self.base_url = "https://api.vapi.ai"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    def make_call(self, phone_number: str, message: str) -> Dict:
        try:
            payload = {
                "phoneNumberId": self.phone_number_id,
                "customer": {
                    "number": phone_number
                },
                "assistant": {
                    "firstMessage": message,
                    "model": {
                        "provider": "openai",
                        "model": "gpt-3.5-turbo",
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are a helpful reminder assistant. Deliver the reminder message clearly and concisely, then end the call."
                            }
                        ]
                    },
                    "voice": {
                        "provider": "11labs",
                        "voiceId": "21m00Tcm4TlvDq8ikWAM"
                    }
                }
            }

            response = requests.post(
                f"{self.base_url}/call/phone",
                json=payload,
                headers=self.headers,
                timeout=30
            )

            response.raise_for_status()
            return {"success": True, "data": response.json()}

        except requests.exceptions.RequestException as e:
            print(f"Vapi call failed: {str(e)}")
            return {"success": False, "error": str(e)}

vapi_service = VapiService()
