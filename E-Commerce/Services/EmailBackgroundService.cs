using E_Commerce.Interfaces;

namespace E_Commerce.Services
{
    public class EmailBackgroundService : BackgroundService
    {
        private readonly IBackgroundEmailQueue _queue;

        public EmailBackgroundService(IBackgroundEmailQueue queue)
        {
            _queue = queue;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                var workItem = await _queue.DequeueAsync(stoppingToken);
                await workItem(stoppingToken);
            }
        }
    }
}
