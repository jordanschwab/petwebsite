# Agent Instructions & Guidelines

## Agent Behavior Standards

All agents in the system must adhere to these standards to ensure consistent, reliable, and secure operation.

## Core Principles

### 1. Autonomy with Oversight
- Agents operate independently within defined parameters
- All significant decisions are logged and can be audited
- Escalation paths exist for uncertain scenarios
- Human oversight available for critical operations

### 2. State Consistency
- Agents maintain idempotent operations where possible
- State changes are atomic and persisted
- Conflict resolution follows defined policies
- Recovery mechanisms restore consistency

### 3. Graceful Degradation
- Agents handle failures without affecting other systems
- Partial success is preferable to complete failure
- Fallback modes activate automatically
- Service remains available during agent failures

### 4. Resource Responsibility
- Agents monitor their resource consumption
- Cleanup after task completion
- Release locks and connections immediately
- Respect rate limits and quotas

## Task Execution Guidelines

### Before Execution
```
1. Validate input parameters
2. Verify dependencies are available
3. Acquire necessary locks/resources
4. Log task initiation with context
5. Set timeout boundaries
```

### During Execution
```
1. Report progress at regular intervals
2. Handle interruption signals gracefully
3. Maintain audit trail of actions
4. Collect metrics and performance data
5. Implement circuit breaker patterns
```

### After Execution
```
1. Release all acquired resources
2. Persist results with metadata
3. Trigger dependent tasks
4. Generate completion report
5. Clean up temporary data
```

## Error Handling Protocol

### Error Categories

**Critical Errors**: System-level failures
- Immediate escalation to admin
- Automatic rollback of changes
- Service degradation prevention

**Recoverable Errors**: Transient failures
- Automatic retry with backoff
- State verification before retry
- Fallback handler activation

**User Errors**: Invalid input/configuration
- Clear error messages to requester
- Logging for pattern analysis
- Self-service recovery documentation

### Recovery Actions

1. **First Attempt**: Log error and prepare retry
2. **Retry Loop**: Execute with exponential backoff (max 3 attempts)
3. **Circuit Break**: Stop attempts if threshold exceeded
4. **Escalate**: Notify monitoring systems
5. **Alert**: Contact on-call operator if critical

## Communication Protocol

### Inter-Agent Communication
- Use message queue for async operations
- Implement request-response pattern for sync calls
- Include correlation IDs for tracing
- Timeout after 30 seconds for blocking calls

### Client Communication
- Provide status updates every 5-10 seconds for long operations
- Include ETA in progress reports
- Deliver final results with completion metadata
- Support webhook callbacks for async results

## Monitoring & Reporting

### Metrics to Track
- Task duration (p50, p95, p99)
- Success/failure rates
- Resource utilization (CPU, memory, I/O)
- Queue depths and processing rates

### Logging Requirements
- Structured JSON format for all logs
- Include context: user_id, request_id, agent_id
- Log level: INFO for normal, ERROR for issues, DEBUG for diagnostics
- Timestamp in ISO 8601 format

### Alerting Thresholds
- Success rate < 95%: Warning
- Success rate < 90%: Critical
- Task duration > 300% of baseline: Warning
- Memory usage > 80% limit: Critical
- Queue depth > 1000 tasks: Warning

## Security Requirements

### Data Handling
- Encrypt sensitive data in transit
- Never log passwords or tokens
- Mask PII in logs and monitoring
- Implement data retention policies

### Access Control
- Agents authenticate with credentials
- Operations validated against permissions
- Audit trail includes requester information
- Sensitive operations require approval

### Rate Limiting
- Respect API rate limits
- Implement exponential backoff
- Queue excess requests properly
- Alert on suspicious patterns

## Testing Guidelines

### Unit Testing
- Each agent method tested in isolation
- Mock external dependencies
- Test error scenarios
- Aim for 80%+ coverage

### Integration Testing
- Test agent-to-agent communication
- Verify message queue behavior
- Test error propagation
- Validate state persistence

### Load Testing
- Test with realistic task volumes
- Verify scaling behavior
- Check resource limits
- Validate queue management

## Deployment Checklist

- [ ] All tests passing
- [ ] Documentation up to date
- [ ] Security review completed
- [ ] Performance benchmarks acceptable
- [ ] Rollback plan documented
- [ ] Monitoring configured
- [ ] Alert rules defined
- [ ] Runbook created
