export const SchedulerService = {
    /**
     * scheduleTask(task: () => Promise<void>, interval: number): NodeJS.Timeout
     * - Schedules a task to run at a specified interval
     * - Returns a timeout ID that can be used to clear the interval
     */
    scheduleTask(task: () => Promise<void>, interval: number): NodeJS.Timeout {
        return setInterval(async () => {
        try {
            await task();
        } catch (error) {
            console.error('Error executing scheduled task:', error);
        }
        }, interval);
    },
    
    /**
     * scheduleTaskAtTimestamp(task: () => Promise<void>, timestamp: number): NodeJS.Timeout
     * - Schedules a task to run at a specific timestamp
     * - Returns a timeout ID that can be used to clear the scheduled task
     * - If the timestamp is in the past, the task will be executed immediately
     */
    scheduleTaskAtTimestamp(task: () => Promise<void>, timestamp: number): NodeJS.Timeout {
        const now = Date.now();
        const delay = Math.max(0, timestamp - now);
        
        return setTimeout(async () => {
            try {
                await task();
            } catch (error) {
                console.error('Error executing scheduled task:', error);
            }
        }, delay);
    },
    
    /**
     * clearScheduledTask(timeoutId: NodeJS.Timeout): void
     * - Clears a previously scheduled task using its timeout ID
     */
    clearScheduledTask(timeoutId: NodeJS.Timeout): void {
        clearInterval(timeoutId);
    }
}