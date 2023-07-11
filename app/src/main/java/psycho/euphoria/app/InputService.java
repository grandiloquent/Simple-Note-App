package psycho.euphoria.app;

import android.app.AlertDialog;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.graphics.PixelFormat;
import android.inputmethodservice.InputMethodService;
import android.inputmethodservice.Keyboard;
import android.inputmethodservice.KeyboardView;
import android.net.Uri;
import android.os.Environment;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.view.inputmethod.InputConnection;
import android.widget.FrameLayout;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.regex.Pattern;
import static java.lang.Math.max;
import static java.lang.Math.min;

// InputServiceHelper
public class InputService extends InputMethodService implements KeyboardView.OnKeyboardActionListener {

    private final Pattern mChinese = Pattern.compile("[\\u4e00-\\u9fa5]");
    private KeyboardView kv;
    private Keyboard keyboard;
    private String mCurrentString = "";
    private boolean caps = false;
    private Database mDatabase;

    public static void createFloatView(Context context, String s) {
        final WindowManager.LayoutParams params;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            params = new WindowManager.LayoutParams(
                    WindowManager.LayoutParams.MATCH_PARENT,
                    WindowManager.LayoutParams.MATCH_PARENT,
                    WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
                    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
                    PixelFormat.TRANSLUCENT);
        } else {
            params = new WindowManager.LayoutParams(
                    WindowManager.LayoutParams.MATCH_PARENT,
                    WindowManager.LayoutParams.MATCH_PARENT,
                    WindowManager.LayoutParams.TYPE_PHONE,
                    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
                    PixelFormat.TRANSLUCENT);
        }
        WindowManager windowManager = (WindowManager) context.getSystemService(Context.WINDOW_SERVICE);
        //获取屏幕的高度
        DisplayMetrics dm = new DisplayMetrics();
        windowManager.getDefaultDisplay().getMetrics(dm);
        int width = dm.widthPixels;
        int height = dm.heightPixels;
        //设置window type
        //设置图片格式，效果为背景透明
        params.format = PixelFormat.RGBA_8888;
        //设置浮动窗口不可聚焦（实现操作除浮动窗口外的其他可见窗口的操作）
        //调整悬浮窗显示的停靠位置为右侧侧置顶，方便实现触摸滑动
        params.gravity = Gravity.LEFT | Gravity.TOP;
        // 以屏幕左上角为原点，设置x、y初始值
//        params.width = width;
//        params.x = width / 6 / 2;
//        params.height = height;
//        params.y = height / 3 / 2;
        //设置悬浮窗口长宽数据
        LayoutInflater inflater = LayoutInflater.from(context);
        //获取浮动窗口视图所在布局
        View layout = inflater.inflate(R.layout.float_layout, null);
//        int w = View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED);
//        int h = View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED);
//        layout.measure(w, h);
        FrameLayout.LayoutParams layoutParams = new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);
        int margin = max(width, height) / 8; //dpToPx(context, 30);
        if (width > height)
            layoutParams.setMargins(margin << 1, margin, margin << 1, margin);
        else
            layoutParams.setMargins(margin >> 1, margin << 1, margin >> 1, margin << 1);
        layout.findViewById(R.id.layout).setLayoutParams(layoutParams);
        //添加mFloatLayout
        windowManager.addView(layout, params);
        ((TextView) layout.findViewById(R.id.dst)).setText(s);
        layout.findViewById(R.id.layout)
                .setOnClickListener(v -> {
                    ClipboardManager manager = (ClipboardManager) context.getSystemService(Context.CLIPBOARD_SERVICE);
                    manager.setPrimaryClip(ClipData.newPlainText(null, s));
                    Toast.makeText(context, "已复制到剪切板", Toast.LENGTH_SHORT).show();
                });
        layout.setOnClickListener(v -> windowManager.removeView(layout));
//        int w = View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED);
//        int h = View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED);
//        //设置layout大小
//        mFloatLayout.measure(w, h);
        //设置监听浮动窗口的触摸移动
    }

    public static String readAssetAsString(Context context, String assetName) {
        InputStream inputStream = null;
        try {
            inputStream = context.getAssets().open(assetName);
            int size = inputStream.available();
            byte[] buffer = new byte[size];
            inputStream.read(buffer);
            inputStream.close();
            return new String(buffer, StandardCharsets.UTF_8);

        } catch (IOException e) {
            if (inputStream != null) {
                try {
                    inputStream.close();
                } catch (IOException ex) {
                }
            }

        }
        return null;
    }

    public static String translate(String to, String q) throws Exception {
        URL url = new URL("http://kingpunch.cn/translate?to=" + to + "&q=" + Uri.encode(q));
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        InputStream is = connection.getInputStream();
        BufferedReader in = new BufferedReader(new InputStreamReader(is));
        String line = in.readLine();
        StringBuilder json = new StringBuilder();
        while (line != null) {
            json.append(line);
            line = in.readLine();
        }
        JSONObject jsonObject = new JSONObject(json.toString());
        JSONArray sentences = jsonObject.getJSONArray("sentences");
        StringBuilder stringBuilder = new StringBuilder();
        for (int i = 0; i < sentences.length(); i++) {
            stringBuilder.append(sentences.getJSONObject(i).getString("trans")).append('\n');
        }
        return stringBuilder.toString();
    }

    public static String translateWord(String q, Database database) throws Exception {
        String result = database.query(q);
        if (result != null) {
            return result;
        }
        String catchData = "https://dictionaryapi.com/api/v3/references/learners/json/" +
                Uri.encode(q) + "?key=cfb57e42-44bb-449d-aa59-1a61d2ca31f0";
        URL url = new URL(catchData);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        InputStream is = connection.getInputStream();
        BufferedReader in = new BufferedReader(new InputStreamReader(is));
        String line = in.readLine();
        StringBuffer json = new StringBuffer();
        while (line != null) {
            json.append(line);
            line = in.readLine();
        }
        JSONArray jsonArray = new JSONArray(String.valueOf(json));
        JSONObject jsonObject = jsonArray.getJSONObject(0);
        JSONArray shortdefarray = jsonObject.getJSONArray("shortdef");
        StringBuilder stringBuilder = new StringBuilder();
        for (int i = 0; i < shortdefarray.length(); i++) {
            stringBuilder.append(shortdefarray.getString(i)).append('\n');
        }
        if (stringBuilder.toString().length() > 0) {
            database.insert(q, stringBuilder.toString());
        }
        return stringBuilder.toString();
    }

    @Override
    public void onCreate() {
        super.onCreate();
        ClipboardManager clipboardManager = (ClipboardManager) getSystemService(CLIPBOARD_SERVICE);
        clipboardManager.addPrimaryClipChangedListener(() -> {
            ClipData clipData = clipboardManager.getPrimaryClip();
            if (clipData == null) return;
            if (clipData.getItemCount() > 0) {
                CharSequence charSequence = clipData.getItemAt(0).getText();
                if (charSequence == null || mCurrentString.equals(charSequence.toString())) {
                    return;
                }
                mCurrentString = charSequence.toString();
                if (mCurrentString.startsWith("http://") || mCurrentString.startsWith("https://"))
                    return;
                if (!mChinese.matcher(charSequence.toString()).find()) {
                    new Thread(() -> {
                        String response = "";
                        try {
                            response = mCurrentString.contains(" ") ? translate("zh", mCurrentString) : translateWord(mCurrentString, mDatabase);
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                        String finalResponse = response;
                        Shared.postOnMainThread(() -> {
                            Shared.createFloatView(this, finalResponse);
                        });
                    }).start();
                } else {
                    new Thread(() -> {
                        String response = "";
                        try {
                            response = translate("en", mCurrentString);
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                        String finalResponse = response;
                        Shared.postOnMainThread(() -> {
                            Shared.createFloatView(this, finalResponse);
                        });
                    }).start();
                }
            }
        });
        mDatabase = new Database(this,
                new File(getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS), "psycho.db").getAbsolutePath());

    }

    @Override
    public View onCreateInputView() {
        kv = (KeyboardView) getLayoutInflater().inflate(R.layout.keyboard, null);
        keyboard = new Keyboard(this, R.xml.qwerty);
        // keyboard_sym = new Keyboard(this, R.xml.symbol);
        kv.setKeyboard(keyboard);
        kv.setOnKeyboardActionListener(this);
        return kv;
    }


    @Override
    public void onKey(int primaryCode, int[] keyCodes) {
        InputConnection ic = getCurrentInputConnection();
        switch (primaryCode) {
            case Keyboard.KEYCODE_DELETE:
                ic.deleteSurroundingText(1, 0);
                break;
//            case Keyboard.KEYCODE_SHIFT:
//                caps = !caps;
//                keyboard.setShifted(caps);
//                kv.invalidateAllKeys();
//                break;
//            case Keyboard.KEYCODE_DONE:
//                ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN, KeyEvent.KEYCODE_ENTER));
//                break;
//            case 1000: {
//                // kv.setKeyboard(keyboard_sym);
//                break;
//            }
//            case 1001: {
//                //  kv.setKeyboard(keyboard);
//                break;
//            }
//            default:
//                char code = (char) primaryCode;
//                if (Character.isLetter(code) && caps) {
//                    code = Character.toUpperCase(code);
//                }
//                ic.commitText(String.valueOf(code), 1);
        }

    }

    @Override
    public void onPress(int primaryCode) {
        Log.e("SimpleKeyboard", "Hello3 " + primaryCode);

    }

    @Override
    public void onRelease(int primaryCode) {
    }

    @Override
    public void onText(CharSequence text) {
        Log.e("SimpleKeyboard", "Hello2 " + text);
    }

    @Override
    public void swipeDown() {
    }

    @Override
    public void swipeLeft() {
    }

    @Override
    public void swipeRight() {
    }

    @Override
    public void swipeUp() {
    }

    public static class Database extends SQLiteOpenHelper {

        public Database(Context context, String name) {
            super(context, name, null, 1);
        }

        public void insert(String word, String en) {
            ContentValues values = new ContentValues();
            values.put("word", word);
            values.put("en", en);
            values.put("create_at", System.currentTimeMillis());
            getWritableDatabase().insert("words", null, values);
        }

        public String query(String word) {
            Cursor cursor = getReadableDatabase().rawQuery("select en from words where word = ? limit 1", new String[]{word});
            String result = null;
            if (cursor.moveToNext()) {
                result = cursor.getString(0);
            }
            cursor.close();
            return result;
        }

        @Override
        public void onCreate(SQLiteDatabase db) {
            db.execSQL("create table if not exists words (_id integer primary key,word text unique, en text, create_at integer)");
        }

        @Override
        public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        }
    }
}
