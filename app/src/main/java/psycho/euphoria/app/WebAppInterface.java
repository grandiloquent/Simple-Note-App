package psycho.euphoria.app;

import android.app.DownloadManager;
import android.app.DownloadManager.Request;
import android.app.Presentation;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.media.AudioManager;
import android.media.MediaScannerConnection;
import android.media.MediaScannerConnection.MediaScannerConnectionClient;
import android.net.Uri;
import android.os.BatteryManager;
import android.os.Environment;
import android.os.PowerManager;
import android.preference.PreferenceManager;
import android.service.autofill.FieldClassification.Match;
import android.util.Log;
import android.view.inputmethod.InputMethodManager;
import android.webkit.JavascriptInterface;
import android.webkit.MimeTypeMap;
import android.widget.Toast;

import com.coremedia.iso.boxes.Container;
import com.coremedia.iso.boxes.MovieHeaderBox;
import com.googlecode.mp4parser.FileDataSourceImpl;
import com.googlecode.mp4parser.authoring.Movie;
import com.googlecode.mp4parser.authoring.Track;
import com.googlecode.mp4parser.authoring.builder.DefaultMp4Builder;
import com.googlecode.mp4parser.authoring.container.mp4.MovieCreator;
import com.googlecode.mp4parser.authoring.tracks.CroppedTrack;
import com.googlecode.mp4parser.util.Matrix;
import com.googlecode.mp4parser.util.Path;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileFilter;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.InetSocketAddress;
import java.net.Proxy;
import java.net.Proxy.Type;
import java.net.URL;
import java.nio.channels.WritableByteChannel;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
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

    @JavascriptInterface
    public void createPdfFromImages(String dir) {
        File directory = new File(dir);
        if (!directory.isDirectory()) {
            return;
        }
        File[] files = directory.listFiles(file -> file.isFile() && (file.getName().endsWith(".jpg")
                || file.getName().endsWith(".png")
                || file.getName().endsWith(".jpeg")
        ));
        if (files == null || files.length == 0) return;
        ArrayList<String> arrayList = new ArrayList<>();
        for (File file : files) {
            arrayList.add(file.getPath());
        }
        Utils.createPdfFromImages(new File(dir, "image.pdf").getPath(), arrayList, 32, 32, 32, 32);
    }

    @JavascriptInterface
    public void downloadFile(String fileName, String uri) {
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
    public String getVideoAddress(String url) {
        AtomicReference<String> result = new AtomicReference<>();
        Thread thread = new Thread(() -> {
            try {
                HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
                String res = Shared.readString(connection);
                res = Shared.substringAfter(res, "sl: \"");
                res = Shared.substringBefore(res, "\"");
                result.set(res);
            } catch (Exception ignored) {
            }
        });
        thread.start();
        try {
            thread.join();
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        return result.get();
    }

    @JavascriptInterface
    public String launchApp(String text) {
        String path = null;
        if (text.equals("文本图片")) {
            path = "/text.html";
        }
        if (text.equals("天气")) {
            path = "/weather.html";
        }
        if (text.equals("拼音")) {
            path = "/pinyin.html";
        }
        if (text.startsWith("声音")) {
            AudioManager manager = mContext.getSystemService(AudioManager.class);
            manager.setStreamVolume(AudioManager.STREAM_MUSIC, Integer.parseInt(
                    Shared.substringAfterLast(text, "声音")
            ), 0);
            return null;
        }
        if (text.equals("电池")) {
            BatteryManager batteryManager = mContext.getSystemService(BatteryManager.class);
            StringBuilder stringBuilder = new StringBuilder();
            Integer chargeCounter = batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CHARGE_COUNTER);
            Integer capacity = batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY);
            stringBuilder.append("电池容量：").append(Utils.getBatteryCapacity(mContext))
                    .append("\n")
                    .append(chargeCounter == Integer.MIN_VALUE || capacity == Integer.MIN_VALUE ? 0 : (chargeCounter / capacity) * 100)
                    .append("\n")
                    .append("BATTERY_PROPERTY_CHARGE_COUNTER: ")
                    .append(chargeCounter)
                    .append("\n")
                    .append("BATTERY_PROPERTY_CAPACITY: ")
                    .append(batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY))
                    .append("\n")
                    .append("BATTERY_PROPERTY_ENERGY_COUNTER: ")
                    .append(batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_ENERGY_COUNTER))
                    .append("\n")
                    .append("BATTERY_PROPERTY_CURRENT_NOW: ")
                    .append(batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CURRENT_NOW))
                    .append("\n")
                    .append("BATTERY_PROPERTY_STATUS: ")
                    .append(batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_STATUS))
                    .append("\n")
                    .append("BATTERY_PROPERTY_CURRENT_AVERAGE: ")
                    .append(batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CURRENT_AVERAGE))

            ;
            return stringBuilder.toString();
        }
        if (path != null) {
            openLocalPage(mContext, path);
            return null;
        }
        if (Pattern.compile("^\\d+([a-zA-Z0-9]+\\.)+[a-zA-Z0-9]+$").matcher(text).find()) {
            int length = 1;
            Matcher matcher = Pattern.compile("\\d+").matcher(text);
            if (matcher.find())
                length = matcher.group().length();
            PreferenceManager.getDefaultSharedPreferences(mContext)
                    .edit().putString(text.substring(0, length), text.substring(length)).apply();
        }
        if (text.equals("其他")) {
            Intent service = new Intent(mContext, ServerService.class);
            service.setAction(ServerService.ACTION_SHOOT);
            mContext.startService(service);
            return null;
        }
        Intent launchIntent = mContext.getPackageManager().getLaunchIntentForPackage(text);
        if (launchIntent != null) {
            mContext.startActivity(launchIntent);//null pointer check in case package name was not found
        }
        return null;
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
        return Arrays.stream(apps).sorted(String::compareTo).collect(Collectors.joining("\n"));
    }

    @JavascriptInterface
    public void openFile(String path) {
        mContext.runOnUiThread(() -> {
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(Uri.fromFile(new File(path)), MimeTypeMap.getSingleton().getMimeTypeFromExtension(Shared.substringAfterLast(path, ".")));
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
    public void scanFile(String fileName) {
        MediaScannerConnection.scanFile(mContext, new String[]{fileName}, new String[]{MimeTypeMap.getSingleton().getMimeTypeFromExtension(Shared.substringAfterLast(fileName, "."))}, new MediaScannerConnectionClient() {
            @Override
            public void onMediaScannerConnected() {
                Log.e("B5aOx2", String.format("onMediaScannerConnected, %s", ""));
            }

            @Override
            public void onScanCompleted(String s, Uri uri) {
            }
        });
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

    public static void startTrim(File src, File dst, int startMs, int endMs) throws IOException {
        FileDataSourceImpl file = new FileDataSourceImpl(src);
        Movie movie = MovieCreator.build(file);
        // remove all tracks we will create new tracks from the old
        List<Track> tracks = movie.getTracks();
        movie.setTracks(new LinkedList<Track>());
        double startTime = startMs / 1000;
        double endTime = endMs / 1000;
        boolean timeCorrected = false;
        // Here we try to find a track that has sync samples. Since we can only start decoding
        // at such a sample we SHOULD make sure that the start of the new fragment is exactly
        // such a frame
        for (Track track : tracks) {
            if (track.getSyncSamples() != null && track.getSyncSamples().length > 0) {
                if (timeCorrected) {
                    // This exception here could be a false positive in case we have multiple tracks
                    // with sync samples at exactly the same positions. E.g. a single movie containing
                    // multiple qualities of the same video (Microsoft Smooth Streaming file)
                    throw new RuntimeException("The startTime has already been corrected by another track with SyncSample. Not Supported.");
                }
                startTime = correctTimeToSyncSample(track, startTime, false);
                endTime = correctTimeToSyncSample(track, endTime, true);
                timeCorrected = true;
            }
        }
        for (Track track : tracks) {
            long currentSample = 0;
            double currentTime = 0;
            long startSample = -1;
            long endSample = -1;
            for (int i = 0; i < track.getSampleDurations().length; i++) {
                if (currentTime <= startTime) {
                    // current sample is still before the new starttime
                    startSample = currentSample;
                }
                if (currentTime <= endTime) {
                    // current sample is after the new start time and still before the new endtime
                    endSample = currentSample;
                } else {
                    // current sample is after the end of the cropped video
                    break;
                }
                currentTime += (double) track.getSampleDurations()[i] / (double) track.getTrackMetaData().getTimescale();
                currentSample++;
            }
            movie.addTrack(new CroppedTrack(track, startSample, endSample));
        }
        Container out = new DefaultMp4Builder().build(movie);
        MovieHeaderBox mvhd = Path.getPath(out, "moov/mvhd");
        mvhd.setMatrix(Matrix.ROTATE_180);
        if (!dst.exists()) {
            dst.createNewFile();
        }
        FileOutputStream fos = new FileOutputStream(dst);
        WritableByteChannel fc = fos.getChannel();
        try {
            out.writeContainer(fc);
        } finally {
            fc.close();
            fos.close();
            file.close();
        }
        file.close();
    }

    @JavascriptInterface
    public void switchInputMethod() {
        ((InputMethodManager) mContext.getSystemService(Context.INPUT_METHOD_SERVICE)).showInputMethodPicker();
    }

    @JavascriptInterface
    public String translate(String s, String to) {
        final StringBuilder sb = new StringBuilder();
        try {
            Thread thread = new Thread(() -> {
                String uri = "http://translate.google.com/translate_a/single?client=gtx&sl=auto&tl=" + to + "&dt=t&dt=bd&ie=UTF-8&oe=UTF-8&dj=1&source=icon&q=" + Uri.encode(s);
                try {
                    HttpURLConnection h = (HttpURLConnection) new URL(uri).openConnection(new Proxy(Type.HTTP, new InetSocketAddress("127.0.0.1", 10809)));
                    h.addRequestProperty("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36 Edg/88.0.705.74");
                    h.addRequestProperty("Accept-Encoding", "gzip, deflate, br");
                    String line = null;
                    BufferedReader reader = new BufferedReader(new InputStreamReader(new GZIPInputStream(h.getInputStream())));
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
    public void trimVideo(String src, String dst, float start, float end) {
        new Thread(() -> {
            try {
                startTrim(new File(src), new File(dst), (int) Math.floor(start * 1000), (int) Math.ceil(end * 1000));
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }).start();
    }

    @JavascriptInterface
    public void writeText(String text) {
        ClipboardManager clipboard = (ClipboardManager) mContext.getSystemService(Context.CLIPBOARD_SERVICE);
        ClipData clip = ClipData.newPlainText("demo", text);
        clipboard.setPrimaryClip(clip);
    }

    private static double correctTimeToSyncSample(Track track, double cutHere, boolean next) {
        double[] timeOfSyncSamples = new double[track.getSyncSamples().length];
        long currentSample = 0;
        double currentTime = 0;
        for (int i = 0; i < track.getSampleDurations().length; i++) {
            long delta = track.getSampleDurations()[i];
            if (Arrays.binarySearch(track.getSyncSamples(), currentSample + 1) >= 0) {
                timeOfSyncSamples[Arrays.binarySearch(track.getSyncSamples(), currentSample + 1)] = currentTime;
            }
            currentTime += (double) delta / (double) track.getTrackMetaData().getTimescale();
            currentSample++;

        }
        double previous = 0;
        for (double timeOfSyncSample : timeOfSyncSamples) {
            if (timeOfSyncSample > cutHere) {
                if (next) {
                    return timeOfSyncSample;
                } else {
                    return previous;
                }
            }
            previous = timeOfSyncSample;
        }
        return timeOfSyncSamples[timeOfSyncSamples.length - 1];
    }

    private static void openLocalPage(Context context, String path) {
        PackageManager pm = context.getPackageManager();
        Intent launchIntent = pm.getLaunchIntentForPackage("com.android.chrome");
        launchIntent.setData(Uri.parse("http://" +
                Shared.getDeviceIP(context) + ":8500" + path));
        context.startActivity(launchIntent);
    }

}