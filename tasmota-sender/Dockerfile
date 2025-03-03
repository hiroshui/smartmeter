# Base-Image with Python 3.12
FROM python:3.12-slim

# Set workdir to /app
WORKDIR /app

# Copy script to /app workdir
COPY send-tasmota.py .

# Install all necessary packages
RUN pip install requests

# Start the script via python
CMD ["python", "send-tasmota.py"]
