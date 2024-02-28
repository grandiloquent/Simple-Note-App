package psycho.euphoria.app;

import android.app.Notification;
import android.app.Notification.Action;
import android.app.Notification.Builder;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;
import android.content.pm.PackageManager;
import android.content.res.AssetManager;
import android.net.Uri;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.os.Environment;
import android.os.IBinder;
import android.preference.PreferenceManager;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.Method;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.ServerSocket;
import java.net.SocketException;
import java.net.UnknownHostException;
import java.util.Enumeration;

import android.os.Process;
import android.util.Log;
import android.widget.RemoteViews;

import static psycho.euphoria.app.Shared.getDeviceIP;
import static psycho.euphoria.app.Shared.getUsablePort;

public class ServerService extends Service {
    public static final String ACTION_DISMISS = "psycho.euphoria.app.ServerService.ACTION_DISMISS";
    public static final String ACTION_KILL = "psycho.euphoria.app.ServerService.ACTION_KILL";
    public static final String ACTION_TRANSLATOR = "psycho.euphoria.app.ServerService.ACTION_TRANSLATOR";
    public static final String KP_NOTIFICATION_CHANNEL_ID = "notes_notification_channel";
    public static final String START_SERVER_ACTION = "psycho.euphoria.app.MainActivity.startServer";
    public static final String ACTION_SHUTDOWN = "psycho.euphoria.app.ServerService.ACTION_SHUTDOWN";
    public static final String ACTION_BRO = "psycho.euphoria.app.ServerService.ACTION_BRO";

    public static final String ACTION_OP = "psycho.euphoria.app.ServerService.ACTION_OP";

    static {
/*
加载编译Rust代码后得到共享库。它完整的名称为librust.so
  */
        System.loadLibrary("nativelib");
    }

    SharedPreferences mSharedPreferences;
    String mAddress;

    public static void createNotification(ServerService context, String address) {
        PendingIntent piDismiss = getPendingIntentDismiss(context);
        Intent intent = new Intent(context, MainActivity.class);
        intent.putExtra(MainActivity.KEY_ADDRESS, address);
        intent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        RemoteViews notificationLayout = new RemoteViews(context.getPackageName(), R.layout.notification_small);
        notificationLayout.setOnClickPendingIntent(R.id.other, PendingIntent.getService(context, 0, new Intent(context, ServerService.class)
                .setAction(ACTION_KILL), PendingIntent.FLAG_IMMUTABLE));
        notificationLayout.setOnClickPendingIntent(R.id.dismiss, piDismiss);
        notificationLayout.setOnClickPendingIntent(R.id.translator, PendingIntent.getService(context, 0, new Intent(context, ServerService.class)
                .setAction(ACTION_TRANSLATOR), PendingIntent.FLAG_IMMUTABLE));
        notificationLayout.setOnClickPendingIntent(R.id.clean, PendingIntent.getService(context, 0, new Intent(context, ServerService.class)
                .setAction(ACTION_SHUTDOWN), PendingIntent.FLAG_IMMUTABLE));
        notificationLayout.setOnClickPendingIntent(R.id.app, PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_MUTABLE));
        notificationLayout.setOnClickPendingIntent(R.id.explorer, PendingIntent.getService(context, 0, new Intent(context, ServerService.class)
                .setAction(ACTION_BRO), PendingIntent.FLAG_IMMUTABLE));
        notificationLayout.setOnClickPendingIntent(R.id.op, PendingIntent.getService(context, 0, new Intent(context, ServerService.class)
                .setAction(ACTION_OP), PendingIntent.FLAG_IMMUTABLE));

        Notification notification = new Builder(context, KP_NOTIFICATION_CHANNEL_ID).setContentTitle("笔记")
                .setSmallIcon(android.R.drawable.stat_sys_download)
                .setCustomContentView(notificationLayout)
                .build();
        context.startForeground(1, notification);
    }

    public static void createNotificationChannel(Context context) {
        NotificationChannel notificationChannel = new NotificationChannel(KP_NOTIFICATION_CHANNEL_ID, "笔记", NotificationManager.IMPORTANCE_LOW);
        ((NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE)).createNotificationChannel(notificationChannel);
    }

    public static Notification.Action getAction(PendingIntent piDismiss) {
        return new Notification.Action.Builder(null, "关闭", piDismiss).build();
    }

    public static PendingIntent getPendingIntentDismiss(Context context) {
        Intent dismissIntent = new Intent(context, ServerService.class);
        dismissIntent.setAction(ACTION_DISMISS);
        return PendingIntent.getService(context, 0, dismissIntent, PendingIntent.FLAG_IMMUTABLE);
    }

    public String getString(String key) {
        return mSharedPreferences.getString(key, "");
    }

    public void setString(String key, String value) {
        mSharedPreferences.edit().putString(key, value).apply();
    }

    public static native String startServer(ServerService service, AssetManager assetManager, String host, int port);

    public static native String dic(boolean isChinese, String q);

    private void initialSharedPreferences() {
        File dir = new File(Environment.getExternalStorageDirectory(), ".editor");
        if (!dir.exists()) {
            dir.mkdirs();
        }
        Editor editor = mSharedPreferences.edit();
        if (mSharedPreferences.getString("temp_dir", null) == null) {
            editor.putString("temp_dir", dir.getAbsolutePath());
        }
        editor.putString("port", Integer.toString(getUsablePort(8200))).putString("host", getDeviceIP(this)).commit();
    }

    private void launchActivity() {
        Intent intent = new Intent(START_SERVER_ACTION);
        intent.putExtra(MainActivity.KEY_ADDRESS, mAddress);
        sendBroadcast(intent);
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        mSharedPreferences = PreferenceManager.getDefaultSharedPreferences(this);
        initialSharedPreferences();
        createNotificationChannel(this);
        String host = getDeviceIP(this);
        if (host == null) {
            host = "0.0.0.0";
        }
        int port = 8500;//getUsablePort(8500);
        mAddress = String.format("http://%s:%d", host, port);
        String finalHost = host;
        new Thread(() -> {
            startServer(this, getAssets(), finalHost, port);
        }).start();
        createNotification(this, mAddress);
        launchActivity();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && intent.getAction() != null) {
            if (intent.getAction().equals(ACTION_DISMISS)) {
                stopForeground(true);
                stopSelf();
                Process.killProcess(Process.myPid());
                return START_NOT_STICKY;
            } else if (intent.getAction().equals(ACTION_KILL)) {
                Utils.killProcesses(new String[]{
                        "nekox.messenger",
                        "com.tencent.mm",
                        "com.android.chrome",
                        "org.mozilla.firefox",
                        "com.zhiliaoapp.musically"
                });
            } else if (intent.getAction().equals(ACTION_SHUTDOWN)) {
                Utils.takePhoto();
            } else if (intent.getAction().equals(ACTION_TRANSLATOR)) {
                PackageManager pm = getPackageManager();
                Intent launchIntent = pm.getLaunchIntentForPackage("psycho.euphoria.translator");
                startActivity(launchIntent);
            } else if (intent.getAction().equals(ACTION_BRO)) {
                PackageManager pm = getPackageManager();
                Intent launchIntent = pm.getLaunchIntentForPackage("psycho.euphoria.n");
//                launchIntent.setData(Uri.parse("http://" +
//                        Shared.getDeviceIP(this) + ":8500/app.html"));
                startActivity(launchIntent);
            // com.android.chrome
            }else if (intent.getAction().equals(ACTION_OP)) {
                PackageManager pm = getPackageManager();
                Intent launchIntent = pm.getLaunchIntentForPackage("com.android.chrome");
//                launchIntent.setData(Uri.parse("http://" +
//                        Shared.getDeviceIP(this) + ":8500/app.html"));
                startActivity(launchIntent);
                // com.android.chrome
            }


        }
        return super.onStartCommand(intent, flags, startId);
    }

    public static native void openCamera();

    native void cameraPreview();

    public static native void takePhoto();

    public static native void deleteCamera();
}