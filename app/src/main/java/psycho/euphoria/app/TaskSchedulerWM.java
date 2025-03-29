package psycho.euphoria.app;

import android.content.Context;

import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.OneTimeWorkRequest;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;
import androidx.work.Worker;
import androidx.work.WorkerParameters;
import java.util.Calendar;
import java.util.concurrent.TimeUnit;

public class TaskSchedulerWM {

    public static void scheduleTask(Context context, int hour, int minute) {
//        Calendar calendar = Calendar.getInstance();
//        calendar.setTimeInMillis(System.currentTimeMillis());
////        calendar.set(Calendar.HOUR_OF_DAY, hour);
////        calendar.set(Calendar.MINUTE, minute);
////        calendar.set(Calendar.SECOND, 0);
//        calendar.add(Calendar.MINUTE, minute);
//
//        long delay = calendar.getTimeInMillis() - System.currentTimeMillis();
//
//        if (delay <= 0) {
//            calendar.add(Calendar.DAY_OF_YEAR, 1);
//            delay = calendar.getTimeInMillis() - System.currentTimeMillis();
//        }

//        OneTimeWorkRequest workRequest = new OneTimeWorkRequest.Builder(TaskWorker.class)
//                .setInitialDelay(delay, TimeUnit.MILLISECONDS)
//                .build();
        PeriodicWorkRequest workRequest = new PeriodicWorkRequest.Builder(
                TaskWorker.class, minute, TimeUnit.MINUTES)
                .build();
       // WorkManager.getInstance(context).enqueue(workRequest);
        WorkManager.getInstance().enqueueUniquePeriodicWork("PWR", ExistingPeriodicWorkPolicy.KEEP, workRequest);
    }

    public static class TaskWorker extends Worker {
        private Context mContext;
        public TaskWorker(Context context, WorkerParameters workerParams) {
            super(context, workerParams);
            mContext=context;
        }

        @Override
        public Result doWork() {
            // Your task code here
            System.out.println("WorkManager task executed at: " + Calendar.getInstance().getTime());
            LockScreenManager lockScreenManager = new LockScreenManager(mContext);
            lockScreenManager.lockScreen();

            return Result.success();
        }
    }
}