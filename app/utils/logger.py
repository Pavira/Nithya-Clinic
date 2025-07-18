import logging

# Define some ANSI escape codes for colors
RESET = "\033[0m"
GREEN = "\033[32m"
YELLOW = "\033[33m"
RED = "\033[31m"

logger = logging.getLogger("app_logger")
logger.setLevel(logging.INFO)

# Create a custom formatter with colors
formatter = logging.Formatter(
    f"{GREEN}[%(asctime)s]{RESET} {YELLOW}[%(levelname)s]{RESET} %(message)s"
)

console_handler = logging.StreamHandler()
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)
