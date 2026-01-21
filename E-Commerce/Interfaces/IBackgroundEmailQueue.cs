namespace E_Commerce.Interfaces
{
    public interface IBackgroundEmailQueue
    {
        void QueueEmail(Func<CancellationToken, Task> workItem);
        Task<Func<CancellationToken, Task>> DequeueAsync(
            CancellationToken cancellationToken);
    }
}
