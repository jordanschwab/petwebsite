"""
Base Agent Class

Provides foundational functionality for all agent types in the system.
"""

import logging
import uuid
from datetime import datetime
from enum import Enum
from typing import Any, Callable, Dict, List, Optional
from dataclasses import dataclass, asdict
import json


class AgentState(Enum):
    """Agent operational states."""
    CREATED = "created"
    INITIALIZED = "initialized"
    ACTIVE = "active"
    IDLE = "idle"
    ERROR = "error"
    TERMINATED = "terminated"


class TaskStatus(Enum):
    """Task execution status."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class Task:
    """Represents a task to be executed by an agent."""
    task_id: str
    task_type: str
    payload: Dict[str, Any]
    created_at: datetime
    status: TaskStatus = TaskStatus.PENDING
    result: Optional[Any] = None
    error: Optional[str] = None
    retries: int = 0
    max_retries: int = 3

    def to_dict(self) -> Dict[str, Any]:
        """Convert task to dictionary."""
        data = asdict(self)
        data['status'] = self.status.value
        data['created_at'] = self.created_at.isoformat()
        return data


@dataclass
class AgentConfig:
    """Configuration for agent initialization."""
    agent_id: Optional[str] = None
    agent_type: str = "base"
    max_tasks: int = 100
    timeout_seconds: int = 300
    enable_persistence: bool = True
    log_level: str = "INFO"


class BaseAgent:
    """Base class for all agents in the system."""

    def __init__(self, config: AgentConfig):
        """Initialize the agent."""
        self.agent_id = config.agent_id or str(uuid.uuid4())
        self.agent_type = config.agent_type
        self.max_tasks = config.max_tasks
        self.timeout_seconds = config.timeout_seconds
        self.enable_persistence = config.enable_persistence

        self.state = AgentState.CREATED
        self.task_queue: List[Task] = []
        self.completed_tasks: Dict[str, Task] = {}
        self.created_at = datetime.utcnow()

        # Setup logging
        self.logger = self._setup_logger(config.log_level)
        self.logger.info(f"Agent {self.agent_id} created with type {self.agent_type}")

    def _setup_logger(self, log_level: str) -> logging.Logger:
        """Setup logger for the agent."""
        logger = logging.getLogger(self.agent_id)
        logger.setLevel(getattr(logging, log_level))

        if not logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            logger.addHandler(handler)

        return logger

    def initialize(self) -> bool:
        """Initialize the agent."""
        try:
            self.logger.info("Initializing agent")
            self.state = AgentState.INITIALIZED
            self.logger.info("Agent initialized successfully")
            return True
        except Exception as e:
            self.logger.error(f"Initialization failed: {str(e)}")
            self.state = AgentState.ERROR
            return False

    def queue_task(self, task_type: str, payload: Dict[str, Any]) -> str:
        """Queue a new task."""
        if len(self.task_queue) >= self.max_tasks:
            raise RuntimeError(f"Task queue full (max: {self.max_tasks})")

        task = Task(
            task_id=str(uuid.uuid4()),
            task_type=task_type,
            payload=payload,
            created_at=datetime.utcnow()
        )

        self.task_queue.append(task)
        self.logger.info(f"Task {task.task_id} queued: {task_type}")
        return task.task_id

    def process_task(self, task: Task) -> bool:
        """Process a single task. Override in subclasses."""
        try:
            self.logger.info(f"Processing task {task.task_id}")
            task.status = TaskStatus.RUNNING

            # Default implementation: mark as completed
            task.result = {"status": "completed", "timestamp": datetime.utcnow().isoformat()}
            task.status = TaskStatus.COMPLETED

            self.logger.info(f"Task {task.task_id} completed")
            return True

        except Exception as e:
            self.logger.error(f"Task {task.task_id} failed: {str(e)}")
            task.error = str(e)
            task.retries += 1

            if task.retries < task.max_retries:
                task.status = TaskStatus.PENDING
                self.task_queue.append(task)
            else:
                task.status = TaskStatus.FAILED

            return False

    def run(self) -> None:
        """Main agent loop."""
        if not self.initialize():
            return

        self.state = AgentState.ACTIVE
        self.logger.info("Agent running")

        try:
            while self.state == AgentState.ACTIVE:
                if self.task_queue:
                    task = self.task_queue.pop(0)
                    self.process_task(task)
                    self.completed_tasks[task.task_id] = task
                else:
                    self.state = AgentState.IDLE
                    break

        except KeyboardInterrupt:
            self.logger.info("Agent interrupted by user")
        except Exception as e:
            self.logger.error(f"Unexpected error in agent loop: {str(e)}")
            self.state = AgentState.ERROR
        finally:
            self.terminate()

    def get_status(self) -> Dict[str, Any]:
        """Get agent status."""
        return {
            "agent_id": self.agent_id,
            "agent_type": self.agent_type,
            "state": self.state.value,
            "created_at": self.created_at.isoformat(),
            "queue_size": len(self.task_queue),
            "completed_tasks": len(self.completed_tasks),
            "uptime_seconds": (datetime.utcnow() - self.created_at).total_seconds()
        }

    def get_task_status(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Get status of a specific task."""
        # Check completed tasks
        if task_id in self.completed_tasks:
            return self.completed_tasks[task_id].to_dict()

        # Check queued tasks
        for task in self.task_queue:
            if task.task_id == task_id:
                return task.to_dict()

        return None

    def terminate(self) -> None:
        """Terminate the agent gracefully."""
        self.state = AgentState.TERMINATED
        self.logger.info(f"Agent {self.agent_id} terminated. Processed {len(self.completed_tasks)} tasks")


def main():
    """Example usage of the base agent."""
    config = AgentConfig(
        agent_type="example",
        log_level="INFO"
    )

    agent = BaseAgent(config)

    # Queue some tasks
    task_id_1 = agent.queue_task("example_task", {"message": "Hello"})
    task_id_2 = agent.queue_task("example_task", {"message": "World"})

    # Run the agent
    agent.run()

    # Print results
    print("\nAgent Status:")
    print(json.dumps(agent.get_status(), indent=2))

    print("\nTask Status:")
    print(json.dumps(agent.get_task_status(task_id_1), indent=2))


if __name__ == "__main__":
    main()
