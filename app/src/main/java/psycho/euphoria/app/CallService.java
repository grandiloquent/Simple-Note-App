package psycho.euphoria.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.telecom.Call;
import android.telecom.InCallService;
import android.telecom.VideoProfile;
import android.os.Process;

public class CallService extends InCallService {
    public static final String ACTION_ANSWER = "psycho.euphoria.app.ServerService.ACTION_ANSWER";
    public static final String ACTION_HANG_UP = "psycho.euphoria.app.ServerService.ACTION_HANG_UP";
    public static final String KP_NOTIFICATION_CHANNEL_ID = "phone_notification_channel";
    Call mCall;

    public static void createNotification(CallService context, String title) {
        createNotificationChannel(context);
        Notification notification = new Notification.Builder(context, KP_NOTIFICATION_CHANNEL_ID).setContentTitle("笔记")
                .setSmallIcon(android.R.drawable.stat_sys_download)
                .setContentTitle(title)
                .addAction(getAction("接听", getPendingIntent(context, ACTION_ANSWER)))
                .addAction(getAction("挂断", getPendingIntent(context, ACTION_HANG_UP)))
                .build();
        context.startForeground(1, notification);
    }

    public static void createNotificationChannel(Context context) {
        NotificationChannel notificationChannel = new NotificationChannel(KP_NOTIFICATION_CHANNEL_ID, "SVG", NotificationManager.IMPORTANCE_LOW);
        ((NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE)).createNotificationChannel(notificationChannel);
    }


    public static Notification.Action getAction(String name, PendingIntent piDismiss) {
        return new Notification.Action.Builder(null, name, piDismiss).build();
    }

    public static PendingIntent getPendingIntent(Context context, String action) {
        Intent dismissIntent = new Intent(context, CallService.class);
        dismissIntent.setAction(action);
        return PendingIntent.getService(context, 0, dismissIntent, PendingIntent.FLAG_IMMUTABLE);
    }

    @Override
    public void onCallAdded(Call call) {
        super.onCallAdded(call);
        mCall = call;
        String number;
        if (call.getDetails().getGatewayInfo() != null) {
            number = call.getDetails().getGatewayInfo().getOriginalAddress().getSchemeSpecificPart();
        } else {
            number = call.getDetails().getHandle().getSchemeSpecificPart();
        }
        createNotification(this, number);
        call.answer(VideoProfile.STATE_AUDIO_ONLY);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && intent.getAction() != null) {
            if (intent.getAction().equals(ACTION_HANG_UP)) {
                mCall.disconnect();
                stopSelf();
                return START_NOT_STICKY;
            } else if (intent.getAction().equals(ACTION_ANSWER)) {
                mCall.answer(VideoProfile.STATE_AUDIO_ONLY);
            }

        }
        return super.onStartCommand(intent, flags, startId);

    }

    @Override
    public void onCallRemoved(Call call) {
        super.onCallRemoved(call);
    }

    @Override
    public void onCreate() {
        super.onCreate();

    }
}