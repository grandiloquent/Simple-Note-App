package psycho.euphoria.app;

import android.Manifest.permission;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AppOpsManager;
import android.app.NotificationManager;
import android.app.role.RoleManager;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Build;
import android.os.Build.VERSION;
import android.os.Build.VERSION_CODES;
import android.os.Bundle;
import android.os.Environment;
import android.os.Process;
import android.os.StrictMode;
import android.preference.PreferenceManager;
import android.provider.Settings;
import android.provider.Telephony;
import android.view.Menu;
import android.view.MenuItem;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;


import java.io.File;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

import static psycho.euphoria.app.ServerService.ACTION_DISMISS;
import static psycho.euphoria.app.Utils.FetchNodes;


public class MainActivity extends Activity {

    public static final String KEY_ADDRESS = "psycho.euphoria.notes.address";
    public static final String POST_NOTIFICATIONS = "android.permission.POST_NOTIFICATIONS";
    private static final String USER_AGENT = "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1";
    private WebView mWebView;
    //    private BroadcastReceiver mBroadcastReceiver;
    private String mUrl;

    public static void aroundFileUriExposedException() {
        StrictMode.VmPolicy.Builder builder = new StrictMode.VmPolicy.Builder();
        StrictMode.setVmPolicy(builder.build());
        // AroundFileUriExposedException.aroundFileUriExposedException(MainActivity.this);
    }

    public static void enableNotification(Context context) {
        try {
            Intent intent = new Intent();
            intent.setAction(Settings.ACTION_APP_NOTIFICATION_SETTINGS);
            intent.putExtra(Settings.EXTRA_APP_PACKAGE, context.getPackageName());
            intent.putExtra(Settings.EXTRA_CHANNEL_ID, context.getApplicationInfo().uid);
            intent.putExtra("app_package", context.getPackageName());
            intent.putExtra("app_uid", context.getApplicationInfo().uid);
            context.startActivity(intent);
        } catch (Exception e) {
            e.printStackTrace();
            Intent intent = new Intent();
            intent.setAction(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            Uri uri = Uri.fromParts("package", context.getPackageName(), null);
            intent.setData(uri);
            context.startActivity(intent);
        }
    }

    public static WebView initializeWebView(MainActivity context) {
        WebView webView = new WebView(context);
        webView.addJavascriptInterface(new WebAppInterface(context), "NativeAndroid");
        webView.setWebViewClient(new CustomWebViewClient(context));
        webView.setWebChromeClient(new CustomWebChromeClient(context));
        context.setContentView(webView);
        return webView;
    }

    public static void launchServer(MainActivity context) {
        Intent intent = new Intent(context, ServerService.class);
        context.startService(intent);
    }

    public static void requestNotificationPermission(Activity activity) {
        if (Build.VERSION.SDK_INT >= 33) {
            if (activity.checkSelfPermission(POST_NOTIFICATIONS) == PackageManager.PERMISSION_DENIED) {
                if (!activity.shouldShowRequestPermissionRationale(POST_NOTIFICATIONS)) {
                    enableNotification(activity);
                } else {
                    activity.requestPermissions(new String[]{POST_NOTIFICATIONS}, 100);
                }
            }
        } else {
            boolean enabled = activity.getSystemService(NotificationManager.class).areNotificationsEnabled();
            if (!enabled) {
                enableNotification(activity);
            }
        }
    }

    public static void requestStorageManagerPermission(Activity context) {
        // RequestStorageManagerPermission.requestStorageManagerPermission(MainActivity.this);
        if (VERSION.SDK_INT >= VERSION_CODES.R) {
            // 测试是否已获取所有文件访问权限 Manifest.permission.MANAGE_EXTERNAL_STORAGE
            // 该权限允许程序访问储存中的大部分文件
            // 但不包括 Android/data 目录下程序的私有数据目录
            if (!Environment.isExternalStorageManager()) {
                try {
                    Uri uri = Uri.parse("package:psycho.euphoria.app");
                    Intent intent = new Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION, uri);
                    context.startActivity(intent);
                } catch (Exception ex) {
                    Intent intent = new Intent();
                    intent.setAction(Settings.ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION);
                    context.startActivity(intent);
                }
            }
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    public static void setWebView(WebView webView) {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setUserAgentString(USER_AGENT);
        settings.setSupportZoom(false);
    }

    private static void openWithChrome(Context context, String url) {
        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.setData(Uri.parse(url));
        intent.setPackage("com.android.chrome");
        context.startActivity(intent);
    }

    private static void scanFiles(MainActivity mainActivity) {
        File[] files = new File(Environment.getExternalStorageDirectory(), "Books").listFiles();
        List<String> paths = new ArrayList<>();
        for (File f : files) {
            if (f.getName().endsWith(".jpg")
                    || f.getName().endsWith(".jpeg")
                    || f.getName().endsWith(".png")
                    || f.getName().endsWith(".gif")
                    || f.getName().endsWith(".mp4"))
                paths.add(f.getAbsolutePath());
        }
        if (paths.size() > 0)
            MediaScannerConnection.scanFile(
                    mainActivity, paths.toArray(new String[0]), new String[]{
                            "image/*",
                            "video/*"
                    }, null
            );
    }

    private int checkStatus() throws Exception {
        HttpURLConnection httpURLConnection = (HttpURLConnection) new URL(mUrl).openConnection();
        return httpURLConnection.getResponseCode();
    }

    private void initialize() {
        String checkedPermissions = PreferenceManager.getDefaultSharedPreferences(this)
                .getString("permission", null);
        if (checkedPermissions == null) {
            PreferenceManager.getDefaultSharedPreferences(this).edit()
                    .putString("permission", "1").apply();
            requestPermissions();
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            final String myPackageName = getPackageName();
            if (Telephony.Sms.getDefaultSmsPackage(this) == null || !Telephony.Sms.getDefaultSmsPackage(this).equals(myPackageName)) {
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
                    RoleManager roleManager = (RoleManager) getSystemService(ROLE_SERVICE);
                    Intent roleManagerIntent = roleManager.createRequestRoleIntent(RoleManager.ROLE_SMS);
                    roleManagerIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    roleManagerIntent.putExtra(Telephony.Sms.Intents.EXTRA_PACKAGE_NAME, myPackageName);
                    startActivityForResult(roleManagerIntent, 0);
                } else {
                    Intent intent =
                            new Intent(Telephony.Sms.Intents.ACTION_CHANGE_DEFAULT);
                    intent.putExtra(Telephony.Sms.Intents.EXTRA_PACKAGE_NAME, myPackageName);
                    startActivity(intent);
                }
            }
        }
//        Log.e("B5aOx2", String.format("initialize, %s", Environment.getExternalStorageDirectory()));
//
//        new File("/storage/emulated/0/.editor").mkdirs();
//        try {
//            new File("/storage/emulated/0/.editor/app.db")
//                    .createNewFile();
//        } catch (IOException e) {
//            throw new RuntimeException(e);
//        }
        aroundFileUriExposedException();
        requestStorageManagerPermission(this);
        mWebView = initializeWebView(this);
        setWebView(mWebView);
        launchServer(this);
//        Intent intent = getIntent();
//        String address = getIntent().getStringExtra(KEY_ADDRESS);
//        if (address != null) {
//            mWebView.loadUrl(address + "/index.html");
//
//        }
        mUrl = String.format("http://%s:8500/index.html", Shared.getDeviceIP(this));
        openIndex();
    }

    private void openFilePage() {
        if (mUrl != null) {
            String url = Shared.substringBeforeLast(mUrl, "/") + "/app.html";
            openWithChrome(this, url);
        } else {
            Toast.makeText(this, "链接为空", Toast.LENGTH_SHORT).show();
        }

    }

    private void openIndex() {
        new Thread(new Runnable() {
            @Override
            public void run() {
                Process.setThreadPriority(Process.THREAD_PRIORITY_BACKGROUND);
                int max = 10;
                while (max > -1) {
                    try {
                        if (checkStatus() == 200) {
                            break;
                        }
                    } catch (Exception ignored) {
                    }
                    try {
                        Thread.sleep(1000);
                    } catch (InterruptedException e) {
                    }
                    max--;
                }
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mWebView.loadUrl(mUrl);
                    }
                });
            }
        }).start();
    }

    private void openIndexPage() {
        if (mUrl != null) {
            openWithChrome(this, mUrl);
        } else {
            Toast.makeText(this, "链接为空", Toast.LENGTH_SHORT).show();
        }
    }

    private void requestPermissions() {
        requestNotificationPermission(this);
        if (VERSION.SDK_INT >= VERSION_CODES.M) {
            if (!Settings.canDrawOverlays(this)) {
                Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + getPackageName()));
                startActivityForResult(intent, 0);
            }
        }
        List<String> permissions = new ArrayList<>();
        String[] permissionWanted = new String[]{
                permission.ACCESS_WIFI_STATE,
                permission.INTERNET,
                permission.RECORD_AUDIO,
                permission.WRITE_EXTERNAL_STORAGE,
                permission.MOUNT_UNMOUNT_FILESYSTEMS,
                permission.READ_EXTERNAL_STORAGE,
                permission.MANAGE_EXTERNAL_STORAGE,
                permission.FOREGROUND_SERVICE,
                permission.QUERY_ALL_PACKAGES,
                permission.SYSTEM_ALERT_WINDOW,
                permission.POST_NOTIFICATIONS,
                permission.CHANGE_COMPONENT_ENABLED_STATE,
                permission.READ_SMS,
                permission.RECEIVE_SMS,
                permission.SEND_SMS,
                permission.CALL_PHONE,
                permission.READ_PHONE_STATE,
                permission.PROCESS_OUTGOING_CALLS,
                permission.VIBRATE,
                permission.KILL_BACKGROUND_PROCESSES,
                permission.RESTART_PACKAGES
        };
        for (String p : permissionWanted) {
            if (checkSelfPermission(p) != PackageManager.PERMISSION_GRANTED) {
                permissions.add(p);
            }
        }
        if (!permissions.isEmpty()) {
            requestPermissions(permissions.toArray(new String[0]), 0);
        }
    }

    private void stopService() {
        Intent stopService = new Intent(this, ServerService.class);
        stopService.setAction(ACTION_DISMISS);
        startService(stopService);
    }

    private void triggerScan() {
        scanFiles(this);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
//        AppOpsManager appOps = (AppOpsManager) getSystemService(Context.APP_OPS_SERVICE);
//        int mode = appOps.checkOpNoThrow("android:get_usage_stats",
//                android.os.Process.myUid(), getPackageName());
//        boolean granted = mode == AppOpsManager.MODE_ALLOWED;
//        if (!granted)
//            startActivity(new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS));
        initialize();
        //getDatabasePath("app.db").delete();
//        Intent intent=new Intent(this,ImageViewerActivity.class);
//        intent.setData(Uri.fromFile(
//                new File("/storage/emulated/0/Pictures/WeiXin").listFiles()[0]
//        ));
//        startActivity(intent);
    }

    @Override
    protected void onStart() {
        super.onStart();
//        mBroadcastReceiver = new BroadcastReceiver() {
//            @Override
//            public void onReceive(Context context, Intent intent) {
//                mUrl = intent.getStringExtra(KEY_ADDRESS) + "/index.html";
//                mWebView.loadUrl(mUrl);
//            }
//        };
//        IntentFilter intentFilter = new IntentFilter();
//        intentFilter.addAction(START_SERVER_ACTION);
//        registerReceiver(mBroadcastReceiver, intentFilter);
    }

    @Override
    protected void onStop() {
        super.onStop();
//        if (mBroadcastReceiver != null) {
//            unregisterReceiver(mBroadcastReceiver);
//            mBroadcastReceiver = null;
//        }
    }

    @Override
    public void onBackPressed() {
        if (mWebView != null && mWebView.canGoBack()) {
            mWebView.goBack();
            return;
        }
        super.onBackPressed();
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        menu.add(0, 1, 0, "刷新");
        menu.add(0, 3, 0, "保存页面");
        menu.add(0, 6, 0, "首页");
        menu.add(0, 7, 0, "复制");
        menu.add(0, 8, 0, "文件管理器");
        menu.add(0, 13, 0, "清空");
        menu.add(0, 9, 0, "图片");
        menu.add(0, 10, 0, "输入法");
        menu.add(0, 5, 0, "媒体");
        menu.add(0, 17, 0, "锁屏");
        return super.onCreateOptionsMenu(menu);
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            case 1:
                mWebView.reload();
                break;
            case 3:
                Utils.takePhoto();
                break;
            case 5:
                triggerScan();
                break;
            case 6:
                mWebView.loadUrl(mUrl);
                break;
            case 8:
                openFilePage();
                break;
            case 9:
                //Shared.setText(this, Shared.substringBeforeLast(mUrl, "/") + "/subtitle.html?path=");
                //openIndexPage();
                Utils.drawFromClipboard(this);
                break;
            case 7:
                ((ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE)).
                        setPrimaryClip(ClipData.newPlainText(null, mWebView.getUrl()));
                break;
            case 10:
                //Utils.launchInputMethodPicker(this);
                FetchNodes(this);
                break;
            case 13:
                Utils.killProcesses(mUrl);
                break;
            case 17:
                LockScreenManager lockScreenManager = new LockScreenManager(this);
                if (!lockScreenManager.isAdminActive()) {
                    lockScreenManager.requestAdminPermission();
                } else {
                    int time=10;
                    TaskSchedulerWM.scheduleTask(this, 0, time);
                    AlarmScheduler.scheduleAlarm(this, 0, time*2);
                    Toast.makeText(this, "30 分钟后锁屏", Toast.LENGTH_SHORT).show();
                }
                break;
        }
        return super.onOptionsItemSelected(item);
    }


}