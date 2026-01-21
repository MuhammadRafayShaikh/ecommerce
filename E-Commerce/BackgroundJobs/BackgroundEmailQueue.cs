
using System.Threading.Channels;
using E_Commerce.Interfaces;

namespace E_Commerce.BackgroundJobs
{
    public class BackgroundEmailQueue : IBackgroundEmailQueue
    {
        private readonly Channel<Func<CancellationToken, Task>> _queue =
        Channel.CreateUnbounded<Func<CancellationToken, Task>>();

        public void QueueEmail(Func<CancellationToken, Task> workItem)
        {
            _queue.Writer.TryWrite(workItem);
        }

        public async Task<Func<CancellationToken, Task>> DequeueAsync(
            CancellationToken token)
        {
            return await _queue.Reader.ReadAsync(token);
        }
    }
}
