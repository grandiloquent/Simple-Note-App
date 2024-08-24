package psycho.euphoria.app;

import android.Manifest.permission;
import android.app.Notification;
import android.app.Notification.Action;
import android.app.Notification.Builder;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;
import android.content.pm.PackageManager;
import android.content.res.AssetManager;
import android.media.AudioFormat;
import android.media.AudioManager;
import android.media.AudioRecord;
import android.media.AudioTrack;
import android.media.MediaRecorder;
import android.net.Uri;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.os.Environment;
import android.os.IBinder;
import android.preference.PreferenceManager;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.lang.reflect.Method;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.ServerSocket;
import java.net.SocketException;
import java.net.UnknownHostException;
import java.nio.ByteBuffer;
import java.nio.ShortBuffer;
import java.util.Enumeration;
import java.util.concurrent.atomic.AtomicBoolean;

import android.os.Process;
import android.util.Log;
import android.widget.RemoteViews;
import android.widget.Toast;

import static psycho.euphoria.app.Shared.getDeviceIP;
import static psycho.euphoria.app.Shared.getUsablePort;
import static psycho.euphoria.app.Utils.FetchNodes;

public class ServerService extends Service {
    public static final String ACTION_DISMISS = "psycho.euphoria.app.ServerService.ACTION_DISMISS";
    public static final String ACTION_KILL = "psycho.euphoria.app.ServerService.ACTION_KILL";
    public static final String ACTION_TRANSLATOR = "psycho.euphoria.app.ServerService.ACTION_TRANSLATOR";
    public static final String KP_NOTIFICATION_CHANNEL_ID = "notes_notification_channel";
    public static final String START_SERVER_ACTION = "psycho.euphoria.app.MainActivity.startServer";
    public static final String ACTION_SHUTDOWN = "psycho.euphoria.app.ServerService.ACTION_SHUTDOWN";
    public static final String ACTION_SHOOT = "psycho.euphoria.app.ServerService.ACTION_SHOOT";

    public static final String ACTION_BRO = "psycho.euphoria.app.ServerService.ACTION_BRO";

    public static final String ACTION_OP = "psycho.euphoria.app.ServerService.ACTION_OP";
    public static final String ACTION_READER = "psycho.euphoria.app.ServerService.ACTION_READER";
    public static final String ACTION_SERVERS = "psycho.euphoria.app.ServerService.ACTION_SERVERS";

    public static final String ACTION_APP = "psycho.euphoria.app.ServerService.ACTION_APP";
    public static final String ACTION_INPUT = "psycho.euphoria.app.ServerService.ACTION_INPUT";
    public static final String ACTION_ROBOT = "psycho.euphoria.app.ServerService.ACTION_ROBOT";
    public static final String ACTION_SPEED = "psycho.euphoria.app.ServerService.ACTION_SPEED";
    public static final String ACTION_ENGLISH = "psycho.euphoria.app.ServerService.ACTION_ENGLISH";
    public static final String ACTION_BROWSER = "psycho.euphoria.app.ServerService.ACTION_BROWSER";

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
        RemoteViews notificationLayout = new RemoteViews(context.getPackageName(), R.layout.notification_small);
        notificationLayout.setOnClickPendingIntent(R.id.other, PendingIntent.getService(context, 0, new Intent(context, ServerService.class)
                .setAction(ACTION_KILL), PendingIntent.FLAG_IMMUTABLE));
        notificationLayout.setOnClickPendingIntent(R.id.dismiss, piDismiss);
        notificationLayout.setOnClickPendingIntent(R.id.translator, PendingIntent.getService(context, 0, new Intent(context, ServerService.class)
                .setAction(ACTION_TRANSLATOR), PendingIntent.FLAG_IMMUTABLE));
        notificationLayout.setOnClickPendingIntent(R.id.clean, PendingIntent.getService(context, 0, new Intent(context, ServerService.class)
                .setAction(ACTION_SHUTDOWN), PendingIntent.FLAG_IMMUTABLE));
        notificationLayout.setOnClickPendingIntent(R.id.app, PendingIntent.getService(context, 0, new Intent(context, ServerService.class)
                .setAction(ACTION_APP), PendingIntent.FLAG_MUTABLE));
        notificationLayout.setOnClickPendingIntent(R.id.explorer, PendingIntent.getService(context, 0, new Intent(context, ServerService.class)
                .setAction(ACTION_BRO), PendingIntent.FLAG_IMMUTABLE));
        notificationLayout.setOnClickPendingIntent(R.id.op, PendingIntent.getService(context, 0, new Intent(context, ServerService.class)
                .setAction(ACTION_OP), PendingIntent.FLAG_IMMUTABLE));
        notificationLayout.setOnClickPendingIntent(R.id.reader, PendingIntent.getService(context, 0, new Intent(context, ServerService.class)
                .setAction(ACTION_READER), PendingIntent.FLAG_IMMUTABLE));
        notificationLayout.setOnClickPendingIntent(R.id.servers, PendingIntent.getService(context, 0, new Intent(context, ServerService.class)
                .setAction(ACTION_SERVERS), PendingIntent.FLAG_IMMUTABLE));
        notificationLayout.setOnClickPendingIntent(R.id.input, PendingIntent.getService(context, 0, new Intent(context, ServerService.class)
                .setAction(ACTION_INPUT), PendingIntent.FLAG_IMMUTABLE));
        notificationLayout.setOnClickPendingIntent(R.id.robot, PendingIntent.getService(context, 0, new Intent(context, ServerService.class)
                .setAction(ACTION_ROBOT), PendingIntent.FLAG_IMMUTABLE));
        notificationLayout.setOnClickPendingIntent(R.id.speed, PendingIntent.getService(context, 0, new Intent(context, ServerService.class)
                .setAction(ACTION_SPEED), PendingIntent.FLAG_IMMUTABLE));
        notificationLayout.setOnClickPendingIntent(R.id.english, PendingIntent.getService(context, 0, new Intent(context, ServerService.class)
                .setAction(ACTION_ENGLISH), PendingIntent.FLAG_IMMUTABLE));
        notificationLayout.setOnClickPendingIntent(R.id.browser, PendingIntent.getService(context, 0, new Intent(context, ServerService.class)
                .setAction(ACTION_BROWSER), PendingIntent.FLAG_IMMUTABLE));
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
                        "com.zhiliaoapp.musically",
                        "com.eg.android.AlipayGphone",
                        "cn.yonghui.hyd",
                        "com.jingdong.app.mall",
                        "psycho.euphoria.autoclicker"

                });
            } else if (intent.getAction().equals(ACTION_SHUTDOWN)) {
                PackageManager pm = getPackageManager();
                Intent launchIntent = pm.getLaunchIntentForPackage("psycho.euphoria.translator");

                startActivity(launchIntent);
            } else if (intent.getAction().equals(ACTION_SHOOT)) {
                Utils.takePhoto();
            } else if (intent.getAction().equals(ACTION_TRANSLATOR)) {
                Shared.setText(this, "vless://e28bb3f8-e64a-4419-9496-33c46220354b@172.67.194.57:443?path=%2F%3Fed%3D2048&security=tls&encryption=none&host=sdgf.bdfstt.sbs&type=ws&sni=sdgf.bdfstt.sbs#t.me%2FConfigsHub\n" +
                        "vless://f4f69ee1-09df-4ca2-a002-89ee0ec8156a@accolade.toptechnonews.com:443?encryption=none&security=tls&sni=accolade.toptechnonews.com&type=ws&host=accolade.toptechnonews.com&path=%2fnimws#accolade.toptechnonews.com_VLESS_WS\n" +
                        "vless://86cb9a9b-dc2e-45d6-b35d-7ce1daa32a15@172.64.229.31:8443?encryption=none&security=tls&sni=dns68.shift.cloudns.org&type=ws&host=dns68.shift.cloudns.org&path=%2f%3fed%3d2048#%f0%9f%94%92+VL-WS-TLS+%f0%9f%87%ba%f0%9f%87%b8+US-172.64.229.31%3a8443+%f0%9f%93%a1+PING-001.75-MS\n" +
                        "vless://d674009a-4a87-4180-a8fe-9a54f66bd7c9@93.95.230.201:8443?encryption=none&security=tls&sni=vpn.restia.love&type=ws&host=vpn.restia.love&path=%2f%3fed%3d2048#%f0%9f%94%92+VL-WS-TLS+%f0%9f%87%ae%f0%9f%87%b8+IS-93.95.230.201%3a8443+%f0%9f%93%a1+PING-101.30-MS\n" +
                        "vless://b867aa62-33f4-452a-a175-98b84fad295b@172.67.178.12:443?encryption=none&security=tls&sni=unlikelier.toptechnonews.com&type=ws&host=unlikelier.toptechnonews.com&path=%2fnimws#%f0%9f%94%92+VL-WS-TLS+%f0%9f%87%ba%f0%9f%87%b8+US-172.67.178.12%3a443+%f0%9f%93%a1+PING-001.79-MS\n" +
                        "vless://ff3c4db3-2259-479e-a0e0-7af7d1d429db@104.21.40.63:443?encryption=none&security=tls&sni=shaliest.toptechnonews.com&type=ws&host=shaliest.toptechnonews.com&path=%2fnimws#%f0%9f%94%92+VL-WS-TLS+%f0%9f%8f%b4%e2%80%8d%e2%98%a0%ef%b8%8f+NA-104.21.40.63%3a443+%f0%9f%93%a1+PING-001.90-MS\n" +
                        "vless://f5a78514-1a94-486e-92a7-3bc9817095a6@nitriding.appreviewcenter.com:443?encryption=none&security=tls&sni=nitriding.appreviewcenter.com&type=ws&host=nitriding.appreviewcenter.com&path=%2fnimws#nitriding.appreviewcenter.com_VLESS_WS\n" +
                        "vless://d566e589-93f6-4106-8e89-443e9dc748c9@retuned.toptechnonews.com:443?encryption=none&security=tls&sni=retuned.toptechnonews.com&type=ws&host=retuned.toptechnonews.com&path=%2fnimws#retuned.toptechnonews.com_VLESS_WS\n" +
                        "vless://435bda4c-fe5e-42c9-a3ad-15334943b38a@104.21.226.125:80?encryption=none&security=none&type=ws&host=us1.rtacg.com&path=%2f#%f0%9f%94%92+VL-WS-NA+%f0%9f%8f%b4%e2%80%8d%e2%98%a0%ef%b8%8f+NA-104.21.226.125%3a80+%f0%9f%93%a1+PING-007.38-MS\n" +
                        "vless://cf428955-86c2-46b1-8cd7-f111666ff9fc@104.16.29.8:2053?encryption=none&security=tls&sni=sayhello.rokna.online&type=ws&host=sayhello.rokna.online&path=%2fbackup#%f0%9f%94%92+VL-WS-TLS+%f0%9f%8f%b4%e2%80%8d%e2%98%a0%ef%b8%8f+NA-104.16.29.8%3a2053+%f0%9f%93%a1+PING-001.90-MS\n" +
                        "vless://f0604697-d602-11ee-aaa8-00505603e70d@104.21.49.18:443?encryption=none&security=tls&sni=st-fr-1.brocdn.com&type=ws&host=st-fr-1.brocdn.com&path=%2fwebsocket#%f0%9f%94%92+VL-WS-TLS+%f0%9f%8f%b4%e2%80%8d%e2%98%a0%ef%b8%8f+NA-104.21.49.18%3a443+%f0%9f%93%a1+PING-001.84-MS\n" +
                        "vless://d674009a-4a87-4180-a8fe-9a54f66bd7c9@104.16.109.59:443?encryption=none&security=tls&sni=vpn.restia.love&type=ws&host=vpn.restia.love&path=%2f%3fed%3d2048#%f0%9f%94%92+VL-WS-TLS+%f0%9f%8f%b4%e2%80%8d%e2%98%a0%ef%b8%8f+NA-104.16.109.59%3a443+%f0%9f%93%a1+PING-001.72-MS\n" +
                        "vless://435bda4c-fe5e-42c9-a3ad-15334943b38a@104.21.237.122:80?encryption=none&security=none&type=ws&host=us1.rtacg.com&path=%2f#%f0%9f%94%92+VL-WS-NA+%f0%9f%8f%b4%e2%80%8d%e2%98%a0%ef%b8%8f+NA-104.21.237.122%3a80+%f0%9f%93%a1+PING-007.58-MS\n" +
                        "vless://435bda4c-fe5e-42c9-a3ad-15334943b38a@104.18.126.190:80?encryption=none&security=none&type=ws&host=us3.rtacg.com&path=%2f#%f0%9f%94%92+VL-WS-NA+%f0%9f%8f%b4%e2%80%8d%e2%98%a0%ef%b8%8f+NA-104.18.126.190%3a80+%f0%9f%93%a1+PING-001.89-MS\n" +
                        "vless://d674009a-4a87-4180-a8fe-9a54f66bd7c9@158.180.68.56:443?encryption=none&security=tls&sni=vpn.restia.love&type=ws&host=vpn.restia.love&path=%2f%3fed%3d2048#%f0%9f%94%92+VL-WS-TLS+%f0%9f%87%b0%f0%9f%87%b7+KR-158.180.68.56%3a443+%f0%9f%93%a1+PING-190.41-MS\n" +
                        "vless://39d06891-ee89-4316-ae0e-3fcfb9e9714c@172.67.187.219:2052?encryption=none&security=none&type=ws&host=worker-reza2.wbfoppa.workers.dev&path=TELEGRAM...PROXY_MTM%3fed%3d2048#%f0%9f%94%92+VL-WS-NA+%f0%9f%87%ba%f0%9f%87%b8+US-172.67.187.219%3a2052+%f0%9f%93%a1+PING-001.78-MS\n" +
                        "vless://435bda4c-fe5e-42c9-a3ad-15334943b38a@104.21.235.204:80?encryption=none&security=none&type=ws&host=us1.rtacg.com&path=%2f#%f0%9f%94%92+VL-WS-NA+%f0%9f%8f%b4%e2%80%8d%e2%98%a0%ef%b8%8f+NA-104.21.235.204%3a80+%f0%9f%93%a1+PING-024.14-MS\n" +
                        "vless://a61eb3a2-1adb-48cb-ab46-ce225769de16@104.16.61.8:443?encryption=none&security=tls&sni=sp11.tioet.com&alpn=http%2f1.1&type=ws&host=sp11.tioet.com&path=users%3fed%3d2048#%f0%9f%94%92+VL-WS-TLS+%f0%9f%8f%b4%e2%80%8d%e2%98%a0%ef%b8%8f+NA-104.16.61.8%3a443+%f0%9f%93%a1+PING-001.92-MS\n" +
                        "vless://cede337b-9ea5-40e5-a8b1-690bf49ff41d@storeships.toptechnonews.com:443?encryption=none&security=tls&sni=storeships.toptechnonews.com&type=ws&host=storeships.toptechnonews.com&path=%2fnimws#storeships.toptechnonews.com_VLESS_WS\n" +
                        "vless://2517c16a-8099-42a7-aed3-069c56399b61@217.196.107.14:443?encryption=none&security=none&type=ws&path=%2f#%f0%9f%94%92+VL-WS-NONE+%f0%9f%87%b8%f0%9f%87%aa+SE-217.196.107.14%3a443+%f0%9f%93%a1+PING-132.56-MS\n" +
                        "vless://691da42c-0a59-48e2-eb78-441b97ee14e4@146.19.233.85:443?encryption=none&security=tls&sni=de1.alphav2ray.link&type=grpc#%f0%9f%94%92+VL-GRPC-TLS+%f0%9f%87%a9%f0%9f%87%aa+DE-146.19.233.85%3a443+%f0%9f%93%a1+PING-087.38-MS\n" +
                        "vless://0ddfb4dd-d1f0-4416-8d5b-dd00e6d10d66@172.67.171.89:443?encryption=none&security=tls&sni=dk3-vless.sshmax.xyz&type=ws&host=dk3-vless.sshmax.xyz&path=%2fvless#%f0%9f%94%92+VL-WS-TLS+%f0%9f%87%ba%f0%9f%87%b8+US-172.67.171.89%3a443+%f0%9f%93%a1+PING-002.08-MS\n" +
                        "vless://e28bb3f8-e64a-4419-9496-33c46220354b@104.21.224.219:80?encryption=none&security=none&type=ws&host=sdgf.bdfstt.sbs&path=%2fyoutube-%e7%94%b1%e9%9b%b6%e9%96%8b%e5%a7%8b#%d8%b1%d8%a7%db%8c%da%af%d8%a7%d9%86+%7c+VLESS+%7c+%40ShadowProxy66+%7c+CA%f0%9f%87%a8%f0%9f%87%a6+%7c+0%ef%b8%8f%e2%83%a32%ef%b8%8f%e2%83%a3\n");
            } else if (intent.getAction().equals(ACTION_BRO)) {
                PackageManager pm = getPackageManager();
                Intent launchIntent = pm.getLaunchIntentForPackage("psycho.euphoria.n");
//                launchIntent.setData(Uri.parse("http://" +
//                        Shared.getDeviceIP(this) + ":8500/app.html"));
                startActivity(launchIntent);
                // com.android.chrome
            } else if (intent.getAction().equals(ACTION_OP)) {
                PackageManager pm = getPackageManager();
                Intent launchIntent = pm.getLaunchIntentForPackage("com.android.chrome");
//                launchIntent.setData(Uri.parse("http://" +
//                        Shared.getDeviceIP(this) + ":8500/app.html"));
                startActivity(launchIntent);
                // com.android.chrome
            } else if (intent.getAction().equals(ACTION_READER)) {
                PackageManager pm = getPackageManager();
                Intent launchIntent = pm.getLaunchIntentForPackage("psycho.euphoria.o");
                startActivity(launchIntent);
            } else if (intent.getAction().equals(ACTION_SERVERS)) {
                FetchNodes(this);
            } else if (intent.getAction().equals(ACTION_INPUT)) {
//                if (recordingInProgress.get()) {
//                    Toast.makeText(this, "关闭", Toast.LENGTH_SHORT).show();
//                    stopRecording();
//                } else {
//                    startRecording();
//                    Toast.makeText(this, "开始", Toast.LENGTH_SHORT).show();
//
//                }
                Shared.execCmd("am start -n psycho.euphoria.autoclicker/psycho.euphoria.autoclicker.MainActivity",true);
//                PackageManager pm = getPackageManager();
//                Intent launchIntent = pm.getLaunchIntentForPackage("psycho.euphoria.autoclicker");
//                launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
//                startActivity(launchIntent);
            } else if (intent.getAction().equals(ACTION_APP)) {
                Intent app = new Intent(this, MainActivity.class);
                app.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                startActivity(app);
            } else if (intent.getAction().equals(ACTION_ROBOT)) {
                PackageManager pm = getPackageManager();
                Intent launchIntent = pm.getLaunchIntentForPackage("com.android.chrome");
                launchIntent.setData(Uri.parse("http://" +
                        Shared.getDeviceIP(this) + ":8500/app.html"));
                startActivity(launchIntent);
            } else if (intent.getAction().equals(ACTION_SPEED)) {
                PackageManager pm = getPackageManager();
                Intent launchIntent = pm.getLaunchIntentForPackage("com.v2ray.ang");
                startActivity(launchIntent);
            } else if (intent.getAction().equals(ACTION_ENGLISH)) {
                PackageManager pm = getPackageManager();
                Intent launchIntent = pm.getLaunchIntentForPackage("psycho.euphoria.svg");
//                launchIntent.setData(Uri.parse("http://" +
//                        Shared.getDeviceIP(this) + ":8500/editor.html"));
                startActivity(launchIntent);
            } else if (intent.getAction().equals(ACTION_BROWSER)) {
                PackageManager pm = getPackageManager();
                Intent launchIntent = pm.getLaunchIntentForPackage("org.mozilla.firefox");
                startActivity(launchIntent);

            }
        }
        return super.onStartCommand(intent, flags, startId);
    }

    public static native void openCamera();

    native void cameraPreview();

    public static native void takePhoto();

    public static native void deleteCamera();

    private int SAMPLING_RATE_IN_HZ = 44100;
    private static final int CHANNEL_CONFIG = AudioFormat.CHANNEL_IN_MONO;
    private static final int AUDIO_FORMAT = AudioFormat.ENCODING_PCM_16BIT;
    /**
     * Factor by that the minimum buffer size is multiplied. The bigger the factor is the less
     * likely it is that samples will be dropped, but more memory will be used. The minimum buffer
     * size is determined by {@link AudioRecord#getMinBufferSize(int, int, int)} and depends on the
     * recording settings.
     */
    private static final int BUFFER_SIZE_FACTOR = 2;
    /**
     * Size of the buffer where the audio data is stored by Android
     */
    private int BUFFER_SIZE;
    /**
     * Signals whether a recording is in progress (true) or not (false).
     */
    private final AtomicBoolean recordingInProgress = new AtomicBoolean(false);
    private AudioRecord recorder = null;
    private Thread recordingThread = null;

    private void startRecording() {
        if (checkSelfPermission(permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            // TODO: Consider calling
            //    Activity#requestPermissions
            // here to request the missing permissions, and then overriding
            //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
            //                                          int[] grantResults)
            // to handle the case where the user grants the permission. See the documentation
            // for Activity#requestPermissions for more details.
            Toast.makeText(this, "需要录音权限", Toast.LENGTH_SHORT).show();
            return;
        }
        BUFFER_SIZE = 512;// AudioRecord.getMinBufferSize(SAMPLING_RATE_IN_HZ,
        //CHANNEL_CONFIG, AUDIO_FORMAT) * BUFFER_SIZE_FACTOR;
        SAMPLING_RATE_IN_HZ = AudioTrack.getNativeOutputSampleRate(AudioManager.STREAM_SYSTEM);
        int minBufferSize = AudioRecord.getMinBufferSize(SAMPLING_RATE_IN_HZ, CHANNEL_CONFIG, AUDIO_FORMAT);
        recorder = new AudioRecord(MediaRecorder.AudioSource.MIC, SAMPLING_RATE_IN_HZ,
                CHANNEL_CONFIG, AUDIO_FORMAT, minBufferSize);
        recorder.startRecording();
        recordingInProgress.set(true);
        recordingThread = new Thread(new RecordingRunnable(), "Recording Thread");
        recordingThread.start();
    }

    private void stopRecording() {
        if (null == recorder) {
            return;
        }
        recordingInProgress.set(false);
        recorder.stop();
        recorder.release();
        recorder = null;
        recordingThread = null;
    }

    private class RecordingRunnable implements Runnable {

        @Override
        public void run() {
            int i = 1;
            File file = new File(Environment.getExternalStorageDirectory(), String.format("%03d%s", i, ".mp3"));
            while (file.exists()) {
                i++;
                file = new File(Environment.getExternalStorageDirectory(), String.format("%03d%s", i, ".mp3"));

            }
            int state = Mp3Encoder.native_encoder_init(SAMPLING_RATE_IN_HZ, SAMPLING_RATE_IN_HZ, 2, 196, 2);
            short[] audioData = new short[BUFFER_SIZE];
            int mp3BufferSize = (int) (1.25 * BUFFER_SIZE + 7200);
            byte[] mp3Buffer = new byte[mp3BufferSize];
            try (final FileOutputStream outStream = new FileOutputStream(file)) {
                while (recordingInProgress.get()) {
                    int result = recorder.read(audioData, 0, BUFFER_SIZE);
                    if (result < 0) {
                        throw new RuntimeException("Reading of audio buffer failed: " +
                                getBufferReadFailureReason(result));
                    }
                    result = Mp3Encoder.native_encoder_process(audioData, BUFFER_SIZE, mp3Buffer, mp3BufferSize);
                    // Mp3Encoder.native_encoder_flush(mp3Buffer);
                    if (result > 0)
                        outStream.write(mp3Buffer, 0, result);
                }
                Mp3Encoder.native_encoder_close();
            } catch (IOException e) {
                throw new RuntimeException("Writing of recorded audio failed", e);
            }
        }

        private String getBufferReadFailureReason(int errorCode) {
            switch (errorCode) {
                case AudioRecord.ERROR_INVALID_OPERATION:
                    return "ERROR_INVALID_OPERATION";
                case AudioRecord.ERROR_BAD_VALUE:
                    return "ERROR_BAD_VALUE";
                case AudioRecord.ERROR_DEAD_OBJECT:
                    return "ERROR_DEAD_OBJECT";
                case AudioRecord.ERROR:
                    return "ERROR";
                default:
                    return "Unknown (" + errorCode + ")";
            }
        }
    }
}