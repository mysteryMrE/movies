import logging
from colorlog import ColoredFormatter


def setup_colored_logging():
    # Create a logger instance
    logger = logging.getLogger(__name__)  # Or get the root logger: logging.getLogger()
    logger.setLevel(logging.INFO)  # Set the minimum logging level

    # Define the log format and colors
    formatter = ColoredFormatter(
        "%(log_color)s%(levelname)-8s%(reset)s %(message)s",
        datefmt=None,
        reset=True,
        log_colors={
            "DEBUG": "cyan",
            "INFO": "green",
            "WARNING": "yellow",
            "ERROR": "red",
            "CRITICAL": "red,bg_white",
        },
        secondary_log_colors={},
        style="%",
    )

    # Create a stream handler (to output to console)
    handler = logging.StreamHandler()
    handler.setFormatter(formatter)

    # Add the handler to the logger
    # Ensure you don't add multiple handlers if this function is called multiple times,
    # or you'll get duplicate output.
    if not logger.handlers:  # Add handler only if none exist
        logger.addHandler(handler)

    return logger
