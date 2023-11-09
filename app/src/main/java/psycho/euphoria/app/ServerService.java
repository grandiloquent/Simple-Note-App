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
import android.content.res.AssetManager;
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

import static psycho.euphoria.app.Shared.getDeviceIP;
import static psycho.euphoria.app.Shared.getUsablePort;

public class ServerService extends Service {
    public static final String ACTION_DISMISS = "psycho.euphoria.app.ServerService.ACTION_DISMISS";
    public static final String ACTION_KILL = "psycho.euphoria.app.ServerService.ACTION_KILL";
    public static final String KP_NOTIFICATION_CHANNEL_ID = "notes_notification_channel";
    public static final String START_SERVER_ACTION = "psycho.euphoria.app.MainActivity.startServer";


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
        Notification notification = new Builder(context, KP_NOTIFICATION_CHANNEL_ID).setContentTitle("笔记")
                .setSmallIcon(android.R.drawable.stat_sys_download)
                .addAction(getAction(piDismiss))
                .addAction(new Action.Builder(null, "其他",
                        PendingIntent.getService(context, 0, new Intent(context, ServerService.class)
                                .setAction(ACTION_KILL), PendingIntent.FLAG_IMMUTABLE)).build())
                .setContentIntent(PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_MUTABLE)).build();
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

    public static native String dic(String q);

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
                        "com.tencent.mm"
                });
            }

        }
        return super.onStartCommand(intent, flags, startId);
    }

    native void openCamera(boolean isCameraBack, MainActivity mainActivity);

    native void cameraPreview();

   public static native void takePhoto();

    native void deleteCamera();
}