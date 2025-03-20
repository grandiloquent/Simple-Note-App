package psycho.euphoria.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.os.SystemClock;
import android.widget.Toast;
import java.util.Calendar;

public class AlarmReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        LockScreenManager lockScreenManager = new LockScreenManager(context);
        lockScreenManager.lockScreen();
        // Perform your task here
        Toast.makeText(context, "Alarm triggered!", Toast.LENGTH_SHORT).show();
        // You can also start a service or perform other background operations
    }
}
