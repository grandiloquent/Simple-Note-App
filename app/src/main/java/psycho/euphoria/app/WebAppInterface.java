package psycho.euphoria.app;

import android.app.DownloadManager;
import android.app.DownloadManager.Request;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.media.MediaScannerConnection;
import android.media.MediaScannerConnection.MediaScannerConnectionClient;
import android.net.Uri;
import android.os.Environment;
import android.preference.PreferenceManager;
import android.util.Log;
import android.view.inputmethod.InputMethodManager;
import android.webkit.JavascriptInterface;
import android.webkit.MimeTypeMap;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.InetSocketAddress;
import java.net.Proxy;
import java.net.Proxy.Type;
import java.net.URL;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.zip.GZIPInputStream;

public class WebAppInterface {

    private MainActivity mContext;
    SharedPreferences mSharedPreferences;

    public WebAppInterface(MainActivity context) {
        mContext = context;
        mSharedPreferences = PreferenceManager.getDefaultSharedPreferences(context);
    }

    public static Intent buildSharedIntent(Context context, File imageFile) {
        Intent sharingIntent = new Intent(Intent.ACTION_SEND);
        // https://android.googlesource.com/platform/frameworks/base/+/61ae88e/core/java/android/webkit/MimeTypeMap.java
        sharingIntent.setType(MimeTypeMap.getSingleton().getMimeTypeFromExtension(Shared.substringAfterLast(imageFile.getName(), ".")));
        Uri uri = PublicFileProvider.getUriForFile(context, "psycho.euphoria.app.files", imageFile);
        sharingIntent.putExtra(Intent.EXTRA_STREAM, uri);
        return sharingIntent;


    }

    public void check(String uri) {
        try {
            HttpURLConnection c = (HttpURLConnection) new URL(uri).openConnection();
            c.addRequestProperty("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36");
            c.addRequestProperty("Referer", "https://www.ixigua.com/embed/?group_id=7187727505476977210&autoplay=0&wid_try=1");
            c.addRequestProperty("Cookie", "MONITOR_WEB_ID=08ba8ce2-7ae9-4ca7-b286-768b36bb67bb; ttwid=1%7C4Sq4ClTk2TuXZrHMYMak2LaZIKO4AfMX6UQ1Bt071zg%7C1614514848%7C163163a1f5ccaec792b69a9525fb9c1e993f07db8963d4e5a515711478920169; ixigua-a-s=0; SEARCH_CARD_MODE=6934288451864888839_1");
            Log.e("B5aOx2", String.format("check, %s", c.getResponseCode()));
        } catch (Exception e) {
        }
    }


    @JavascriptInterface
    public void downloadFile(String fileName, String uri) {
        new Thread(() -> {
            check(uri);
        }).start();
        try {
            DownloadManager dm = (DownloadManager) mContext.getSystemService(Context.DOWNLOAD_SERVICE);
            Request request = new Request(Uri.parse(uri));
//            request.setAllowedNetworkTypes(DownloadManager.Request.NETWORK_WIFI | DownloadManager.Request.NETWORK_MOBILE)
//                    .setAllowedOverRoaming(false)
//                    .setTitle(fileName)
//                    .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_ONLY_COMPLETION)
//                    .setVisibleInDownloadsUi(false);
            request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName);
            dm.enqueue(request);
        } catch (Exception ignored) {
            Log.e("B5aOx2", String.format("downloadFile, %s", ignored.getMessage()));
        }

    }

    @JavascriptInterface
    public String getString(String key) {
        return mSharedPreferences.getString(key, "");
    }

    @JavascriptInterface
    public void launchApp(String text) {
        Intent launchIntent = mContext.getPackageManager().getLaunchIntentForPackage(text);
        if (launchIntent != null) {
            mContext.startActivity(launchIntent);//null pointer check in case package name was not found
        }
    }

    @JavascriptInterface
    public String listAllPackages() {
        // get list of all the apps installed
        List<ApplicationInfo> infos = mContext.getPackageManager().getInstalledApplications(PackageManager.GET_META_DATA);
        // create a list with size of total number of apps
        String[] apps = new String[infos.size()];
        int i = 0;
        // add all the app name in string list
        for (ApplicationInfo info : infos) {
            apps[i] = info.packageName;
            i++;
        }
        return Arrays.stream(apps)
                .sorted(String::compareTo)
                .collect(Collectors.joining("\n"));
    }

    @JavascriptInterface
    public void openFile(String path) {
        mContext.runOnUiThread(() -> {
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setData(Uri.fromFile(new File(path)));
            mContext.startActivity(Intent.createChooser(intent, "打开"));
        });
    }

    @JavascriptInterface
    public String readText() {
        ClipboardManager clipboard = (ClipboardManager) mContext.getSystemService(Context.CLIPBOARD_SERVICE);
        ClipData clipData = clipboard.getPrimaryClip();
        if (clipData.getItemCount() > 0) {
            CharSequence sequence = clipboard.getPrimaryClip().getItemAt(0).getText();
            if (sequence != null) return sequence.toString();
        }
        return null;
    }

    @JavascriptInterface
    public void setString(String key, String value) {
        mSharedPreferences.edit().putString(key, value).apply();
    }

    @JavascriptInterface
    public void share(String path) {
        try {
            mContext.startActivity(buildSharedIntent(mContext, new File(path)));
        } catch (Exception ignored) {
        }
    }

    @JavascriptInterface
    public void switchInputMethod() {
        ((InputMethodManager) mContext.getSystemService(Context.INPUT_METHOD_SERVICE))
                .showInputMethodPicker();
    }

    @JavascriptInterface
    public String translate(String s, String to) {
        final StringBuilder sb = new StringBuilder();
        try {
            Thread thread = new Thread(() -> {
                String uri = "http://translate.google.com/translate_a/single?client=gtx&sl=auto&tl="
                        + to + "&dt=t&dt=bd&ie=UTF-8&oe=UTF-8&dj=1&source=icon&q=" + Uri.encode(s);
                try {
                    HttpURLConnection h = (HttpURLConnection) new URL(uri).openConnection(
                            new Proxy(Type.HTTP, new InetSocketAddress("127.0.0.1", 10809))
                    );
                    h.addRequestProperty("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36 Edg/88.0.705.74");
                    h.addRequestProperty("Accept-Encoding", "gzip, deflate, br");
                    String line = null;
                    BufferedReader reader = new BufferedReader(new InputStreamReader(
                            new GZIPInputStream(h.getInputStream())
                    ));
                    StringBuilder sb1 = new StringBuilder();
                    while ((line = reader.readLine()) != null) {
                        sb1.append(line).append('\n');
                    }
                    JSONObject object = new JSONObject(sb1.toString());
                    JSONArray array = object.getJSONArray("sentences");
                    for (int i = 0; i < array.length(); i++) {
                        sb.append(array.getJSONObject(i).getString("trans"));
                    }
                } catch (Exception e) {
                }
            });
            thread.start();
            thread.join();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        return sb.toString();
    }

    @JavascriptInterface
    public void writeText(String text) {
        ClipboardManager clipboard = (ClipboardManager) mContext.getSystemService(Context.CLIPBOARD_SERVICE);
        ClipData clip = ClipData.newPlainText("demo", text);
        clipboard.setPrimaryClip(clip);
    }

    @JavascriptInterface
    public void scanFile(String fileName) {
        MediaScannerConnection.scanFile(
                mContext, new String[]{
                        fileName
                }, new String[]{
                        MimeTypeMap.getSingleton().getMimeTypeFromExtension(
                                Shared.substringAfterLast(fileName, ".")
                        )
                }, new MediaScannerConnectionClient() {
                    @Override
                    public void onMediaScannerConnected() {
                        Log.e("B5aOx2", String.format("onMediaScannerConnected, %s", ""));
                    }

                    @Override
                    public void onScanCompleted(String s, Uri uri) {

                    }
                }
        );
    }
}