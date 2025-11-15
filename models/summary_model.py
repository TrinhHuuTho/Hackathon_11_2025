from pydantic import BaseModel

class SummaryResponseModel(BaseModel):
    text: str