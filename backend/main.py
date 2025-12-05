# ... (rest of the file remains the same)

@app.post("/api/greeting")
async def get_greeting(request: GreetingRequest):
    try:
        return GreetingResponse(greeting=design_engine.greeting())
    except Exception as e:
        logger.error(f"Greeting error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
