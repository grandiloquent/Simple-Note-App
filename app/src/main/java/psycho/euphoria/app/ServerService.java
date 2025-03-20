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
import android.content.pm.PackageManager.NameNotFoundException;
import android.content.res.AssetManager;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.Bitmap.CompressFormat;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.Drawable;
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
import android.os.Handler;
import android.os.IBinder;
import android.preference.PreferenceManager;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.lang.reflect.Method;
import java.net.HttpURLConnection;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.ServerSocket;
import java.net.SocketException;
import java.net.URL;
import java.net.UnknownHostException;
import java.nio.ByteBuffer;
import java.nio.ShortBuffer;
import java.util.Enumeration;
import java.util.concurrent.atomic.AtomicBoolean;

import android.os.Process;
import android.provider.Settings;
import android.telecom.VideoProfile;
import android.util.DisplayMetrics;
import android.util.Log;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.view.WindowManager.LayoutParams;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.FrameLayout;
import android.widget.GridView;
import android.widget.RemoteViews;
import android.widget.Toast;

import static java.lang.Math.max;
import static psycho.euphoria.app.Shared.getDeviceIP;
import static psycho.euphoria.app.Shared.getUsablePort;
import static psycho.euphoria.app.Utils.FetchNodes;

public class ServerService extends Service {
    public static final String ACTION_DISMISS = "psycho.euphoria.app.ServerService.ACTION_DISMISS";
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


    public static void createNotification(ServerService context) {
        Notification notification = new Builder(context, KP_NOTIFICATION_CHANNEL_ID).setContentTitle("笔记")
                .setSmallIcon(android.R.drawable.stat_sys_download)
                .setContentIntent(getPendingIntentDismiss(context))
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
        int port = 8500;//getUsablePort(8500);
        mAddress = String.format("http://%s:%d", host, port);
        String finalHost = host;
        new Thread(() -> {
            Process.setThreadPriority(Process.THREAD_PRIORITY_BACKGROUND);
            startServer(this, getAssets(), finalHost, port);
        }).start();
        createNotification(this);
        launchActivity();
        mHandler = new Handler();
        showFloatingButton();
    }

    private View mView;

    private void showFloatingButton() {
        WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.MATCH_PARENT,
                LayoutParams.TYPE_APPLICATION_OVERLAY,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
                PixelFormat.TRANSLUCENT);
//        DisplayMetrics dm = new DisplayMetrics();
        WindowManager wm = getSystemService(WindowManager.class);
        //wm.getDefaultDisplay().getRealMetrics(dm);
        float dip = 56;
        Resources r = getResources();
        int px = (int) TypedValue.applyDimension(
                TypedValue.COMPLEX_UNIT_DIP,
                dip,
                r.getDisplayMetrics()
        );
        int width = px;
        int height = px;
        params.format = PixelFormat.RGBA_8888;
        FrameLayout layout = new FrameLayout(this);
        layout.setBackground(new ColorDrawable(0x00000000));
        FrameLayout.LayoutParams layoutParams = new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);
        layout.setLayoutParams(layoutParams);
        params.width = width;
        params.height = height;
        //params.verticalMargin=dm.heightPixels-height;
        params.gravity = Gravity.LEFT | Gravity.TOP;
        params.x = width;
        mView = layout;
        wm.addView(layout, params);
        layout.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                new AppDialog(ServerService.this).show();
            }
        });
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && intent.getAction() != null) {
            if (intent.getAction().equals(ACTION_DISMISS)) {
                new AppDialog(this).show();
            }
        }
        return START_NOT_STICKY;
    }

    private static class AppDialog {
        private final WindowManager mWindowManager;
        private final Context mContext;

        public AppDialog(Context context) {
            mContext = context;
            mWindowManager = context.getSystemService(WindowManager.class);
        }

        public void show() {
            WindowManager.LayoutParams params = getWindowManagerLayoutParams();
            DisplayMetrics dm = new DisplayMetrics();
            mWindowManager.getDefaultDisplay().getMetrics(dm);
            int width = dm.widthPixels;
            int height = dm.heightPixels;
            params.format = PixelFormat.RGBA_8888;
            params.gravity = Gravity.LEFT | Gravity.TOP;
            WebView layout = new WebView(mContext);
            MainActivity.setWebView(layout);
            layout.addJavascriptInterface(new JInterface(mContext, mWindowManager, layout), "NativeAndroid");
            layout.loadUrl("http://0.0.0.0:8500/apps.html");
            FrameLayout.LayoutParams layoutParams = new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);
            int margin = max(width, height) / 10; //dpToPx(context, 30);
            if (width > height)
                layoutParams.setMargins(margin << 1, margin, margin << 1, margin);
            else
                layoutParams.setMargins(margin >> 1, margin << 1, margin >> 1, margin << 1);
            layout.setLayoutParams(layoutParams);
            params.width = width - margin;
            params.height = height - margin >> 1;
            params.gravity = Gravity.CENTER;
            mWindowManager.addView(layout, params);
        }

        private WindowManager.LayoutParams getWindowManagerLayoutParams() {
            return
                    new WindowManager.LayoutParams(
                            WindowManager.LayoutParams.MATCH_PARENT,
                            WindowManager.LayoutParams.MATCH_PARENT,
                            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
                            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
                            PixelFormat.TRANSLUCENT);
        }

    }

    private static class JInterface {
        private final WindowManager mWindowManager;
        private final WebView mWebView;
        private Context mContext;

        public JInterface(Context context, WindowManager windowManager, WebView webView) {
            mWindowManager = windowManager;
            mWebView = webView;
            mContext = context;
        }

        @android.webkit.JavascriptInterface
        public void close() {
            mWindowManager.removeView(mWebView);
        }

        @android.webkit.JavascriptInterface
        public void volume(int value) {
            AudioManager audioManager = mContext.getSystemService(AudioManager.class);
            int v = value == 0 ? 0 : (int) (audioManager.getStreamVolume(AudioManager.STREAM_MUSIC) +
                    audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC) * (value / 100.0));
            audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, v, 0);
        }

        @android.webkit.JavascriptInterface
        public void switcher() {
            ((ServerService) mContext).switcher();
        }

        @android.webkit.JavascriptInterface
        public void killApps() {
            Intent v = new Intent(Settings.ACTION_MANAGE_APPLICATIONS_SETTINGS);
            v.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_NO_HISTORY);
            mContext.startActivity(v);
        }

        @android.webkit.JavascriptInterface
        public void lockScreen() {
//            Intent v = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
//            v.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_NO_HISTORY);
//            mContext.startActivity(v);
            LockScreenManager lockScreenManager = new LockScreenManager(mContext);
            if (!lockScreenManager.isAdminActive()) {
                lockScreenManager.requestAdminPermission();
            } else {
                TaskSchedulerWM.scheduleTask(mContext, 0, 30);
            }
        }

        @android.webkit.JavascriptInterface
        public void launch(String name) {
            PackageManager packageManager = mContext.getPackageManager();
            Intent v = packageManager.getLaunchIntentForPackage(name);
            if (v != null) {
                File file = new File(Environment.getExternalStorageDirectory(), ".editor/apps");
                if (!file.exists()) {
                    file.mkdirs();
                }
                file = new File(file, name + ".png");
                if (!file.exists()) {
                    try {
                        Drawable pd = packageManager.getApplicationIcon(name);
                        Bitmap bm = Bitmap.createBitmap(pd.getIntrinsicWidth(), pd.getIntrinsicHeight(), Bitmap.Config.ARGB_8888);
                        Canvas canvas = new Canvas(bm);
                        pd.setBounds(0, 0, pd.getIntrinsicWidth(), pd.getIntrinsicHeight());
                        pd.draw(canvas);
                        FileOutputStream fos = null;
                        fos = new FileOutputStream(file);
                        bm.compress(CompressFormat.PNG, 100, fos);
                        fos.close();
                    } catch (Exception e) {
                        Log.e("B5aOx2", String.format("launch, %s", e.getMessage()));
                    }

                }
                v.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_NO_HISTORY);
                mContext.startActivity(v);
            } else {
                try {
                    HttpURLConnection c = (HttpURLConnection) new URL("http://0.0.0.0:8500/app?name=" + name).openConnection();
                    c.setRequestMethod("DELETE");
                    c.getResponseCode();
                } catch (Exception e) {
                }

            }
        }


    }

    private Handler mHandler;

    private void switcher() {
        mHandler.post(new Runnable() {
            @Override
            public void run() {
                if (mView != null) {
                    WindowManager wm = getSystemService(WindowManager.class);
                    wm.removeView(mView);
                    mView = null;
                } else {
                    showFloatingButton();
                }
            }
        });
    }

    native void cameraPreview();

}