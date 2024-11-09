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
import android.os.Build;
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
import android.provider.Settings;
import android.telecom.VideoProfile;
import android.util.Log;
import android.widget.RemoteViews;
import android.widget.Toast;

import static psycho.euphoria.app.Shared.getDeviceIP;
import static psycho.euphoria.app.Shared.getUsablePort;
import static psycho.euphoria.app.Utils.FetchNodes;

public class ServerService extends Service {
    public static final String ACTION_APP = "psycho.euphoria.app.ServerService.ACTION_APP";
    public static final String ACTION_DISMISS = "psycho.euphoria.app.ServerService.ACTION_DISMISS";
    public static final String ACTION_KILL = "psycho.euphoria.app.ServerService.ACTION_KILL";
    public static final String ACTION_ROBOT = "psycho.euphoria.app.ServerService.ACTION_ROBOT";
    public static final String ACTION_SHOOT = "psycho.euphoria.app.ServerService.ACTION_SHOOT";
    public static final String KP_NOTIFICATION_CHANNEL_ID = "notes_notification_channel";
    public static final String START_SERVER_ACTION = "psycho.euphoria.app.MainActivity.startServer";
    private static final int AUDIO_FORMAT = AudioFormat.ENCODING_PCM_16BIT;
    public static final String ACTION_1 = "psycho.euphoria.app.ServerService.ACTION_1";
    public static final String ACTION_2 = "psycho.euphoria.app.ServerService.ACTION_2";
    public static final String ACTION_3 = "psycho.euphoria.app.ServerService.ACTION_3";
    public static final String ACTION_4 = "psycho.euphoria.app.ServerService.ACTION_4";
    public static final String ACTION_5 = "psycho.euphoria.app.ServerService.ACTION_5";
    public static final String ACTION_11 = "psycho.euphoria.app.ServerService.ACTION_11";

    /**
     * Factor by that the minimum buffer size is multiplied. The bigger the factor is the less
     * likely it is that samples will be dropped, but more memory will be used. The minimum buffer
     * size is determined by {@link AudioRecord#getMinBufferSize(int, int, int)} and depends on the
     * recording settings.
     */
    private static final int BUFFER_SIZE_FACTOR = 2;
    private static final int CHANNEL_CONFIG = AudioFormat.CHANNEL_IN_MONO;

    static {
/*
加载编译Rust代码后得到共享库。它完整的名称为librust.so
  */
        System.loadLibrary("nativelib");
    }

    /**
     * Signals whether a recording is in progress (true) or not (false).
     */
    private final AtomicBoolean recordingInProgress = new AtomicBoolean(false);
    SharedPreferences mSharedPreferences;
    String mAddress;
    private int SAMPLING_RATE_IN_HZ = 44100;
    /**
     * Size of the buffer where the audio data is stored by Android
     */
    private int BUFFER_SIZE;
    private AudioRecord recorder = null;
    private Thread recordingThread = null;

    public static void createNotification(ServerService context, String address) {
        PendingIntent piDismiss = getPendingIntentDismiss(context);
        RemoteViews notificationLayout = new RemoteViews(context.getPackageName(), R.layout.notification_small);
        notificationLayout.setOnClickPendingIntent(R.id.other, PendingIntent.getService(context, 0, new Intent(context, ServerService.class)
                .setAction(ACTION_KILL), PendingIntent.FLAG_IMMUTABLE));
        notificationLayout.setOnClickPendingIntent(R.id.dismiss, piDismiss);
        notificationLayout.setOnClickPendingIntent(R.id.app, PendingIntent.getService(context, 0, new Intent(context, ServerService.class)
                .setAction(ACTION_APP), PendingIntent.FLAG_MUTABLE));
        notificationLayout.setOnClickPendingIntent(R.id.robot, PendingIntent.getService(context, 0, new Intent(context, ServerService.class)
                .setAction(ACTION_ROBOT), PendingIntent.FLAG_IMMUTABLE));
        notificationLayout.setOnClickPendingIntent(R.id.action_1, PendingIntent.getService(context, 0, new Intent(context, ServerService.class)
                .setAction(ACTION_1), PendingIntent.FLAG_IMMUTABLE));
        notificationLayout.setOnClickPendingIntent(R.id.action_2, PendingIntent.getService(context, 0, new Intent(context, ServerService.class)
                .setAction(ACTION_2), PendingIntent.FLAG_IMMUTABLE));
        notificationLayout.setOnClickPendingIntent(R.id.action_3, PendingIntent.getService(context, 0, new Intent(context, ServerService.class)
                .setAction(ACTION_3), PendingIntent.FLAG_IMMUTABLE));
        notificationLayout.setOnClickPendingIntent(R.id.action_4, PendingIntent.getService(context, 0, new Intent(context, ServerService.class)
                .setAction(ACTION_4), PendingIntent.FLAG_IMMUTABLE));
        notificationLayout.setOnClickPendingIntent(R.id.action_5, PendingIntent.getService(context, 0, new Intent(context, ServerService.class)
                .setAction(ACTION_5), PendingIntent.FLAG_IMMUTABLE));

        notificationLayout.setOnClickPendingIntent(R.id.action_11, PendingIntent.getService(context, 0, new Intent(context, ServerService.class)
                .setAction(ACTION_11), PendingIntent.FLAG_IMMUTABLE));
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

    public static native void deleteCamera();

    public static native String dic(boolean isChinese, String q);

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

    public static native void openCamera();

    public void setString(String key, String value) {
        mSharedPreferences.edit().putString(key, value).apply();
    }

    public static native String startServer(ServerService service, AssetManager assetManager, String host, int port);

    public static native void takePhoto();

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
            Process.setThreadPriority(Process.THREAD_PRIORITY_BACKGROUND);
            startServer(this, getAssets(), finalHost, port);
        }).start();
        createNotification(this, mAddress);
        launchActivity();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && intent.getAction() != null) {
            if (intent.getAction().equals(ACTION_DISMISS)) {
//                stopForeground(true);
//                stopSelf();
//                Process.killProcess(Process.myPid());
//                return START_NOT_STICKY;
                Intent v = new Intent(Settings.ACTION_MANAGE_APPLICATIONS_SETTINGS);
                v.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_NO_HISTORY);
                startActivity(v);
            } else if (intent.getAction().equals(ACTION_KILL)) {
//                Utils.killProcesses(this, new String[]{
//                        "nekox.messenger",
//                        "com.tencent.mm",
//                        "com.android.chrome",
//                        "org.mozilla.firefox",
//                        "com.zhiliaoapp.musically",
//                        "com.eg.android.AlipayGphone",
//                        "cn.yonghui.hyd",
//                        "com.jingdong.app.mall",
//                        "psycho.euphoria.autoclicker",
//                        "com.kuaishou.nebula",
//                        "psycho.euphoria.screenshoots",
//                        "com.uptodown"
//
//
//                });
                // android.settings.APP_MEMORY_USAGE
//                Intent v = new Intent(Settings.ACTION_MANAGE_APPLICATIONS_SETTINGS);
//                v.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_NO_HISTORY);
//                startActivity(v);
//                Intent v = new Intent(Settings.ACTION_SOUND_SETTINGS);
//                v.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_NO_HISTORY);
//                startActivity(v);
                AppUtils.launchList(this);

            } else if (intent.getAction().equals(ACTION_SHOOT)) {
                Utils.takePhoto();
            } else if (intent.getAction().equals(ACTION_APP)) {
                Intent app = new Intent(this, MainActivity.class);
                app.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                startActivity(app);
            } else if (intent.getAction().equals(ACTION_ROBOT)) {
//                PackageManager pm = getPackageManager();
//                Intent launchIntent = pm.getLaunchIntentForPackage("com.android.chrome");
//                launchIntent.setAction(Intent.ACTION_VIEW).addCategory(Intent.CATEGORY_BROWSABLE).setType("text/plain")
//                        .setData(Uri.parse("http://" +
//                        Shared.getDeviceIP(this) + ":8500/app.html"));
                Intent launchIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("http://0.0.0.0:8500/app.html"));
                launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                startActivity(launchIntent);
            } else if (intent.getAction().equals(ACTION_1)) {
                AudioManager audioManager = getSystemService(AudioManager.class);
                audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, 0, 0);
            } else if (intent.getAction().equals(ACTION_2)) {
                AudioManager audioManager = getSystemService(AudioManager.class);
                int value = audioManager.getStreamVolume(AudioManager.STREAM_MUSIC);
                audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, value + 1, 0);
                Toast.makeText(this, Integer.toString(value + 10), Toast.LENGTH_SHORT).show();
            } else if (intent.getAction().equals(ACTION_3)) {
                AudioManager audioManager = getSystemService(AudioManager.class);
                int value = audioManager.getStreamVolume(AudioManager.STREAM_MUSIC);
                audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, value + 1, 0);
                Toast.makeText(this, Integer.toString(value + 1), Toast.LENGTH_SHORT).show();
            } else if (intent.getAction().equals(ACTION_4)) {
                launch(4);
            } else if (intent.getAction().equals(ACTION_5)) {
                launch(5);
            } else if (intent.getAction().equals(ACTION_11)) {
                Intent v = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
                v.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_NO_HISTORY);
                startActivity(v);
            }

        }
        return super.onStartCommand(intent, flags, startId);
    }

    private void launch(int i) {
        SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(this);
        String packageName = preferences.getString(Integer.toString(i), null);
        if (packageName != null) {
            PackageManager pm = getPackageManager();
            Intent launchIntent = pm.getLaunchIntentForPackage(packageName);
            startActivity(launchIntent);
        }
    }

    private class RecordingRunnable implements Runnable {

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
    }

    native void cameraPreview();
}