package psycho.euphoria.app;

import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.content.pm.PackageManager.NameNotFoundException;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteDatabase.CursorFactory;
import android.database.sqlite.SQLiteOpenHelper;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.graphics.drawable.Drawable;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.BaseAdapter;
import android.widget.FrameLayout;
import android.widget.GridView;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.LinearLayout.LayoutParams;
import android.widget.TextView;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import static java.lang.Math.max;

public class AppUtils {
    public static void launchList(Context context) {
        final WindowManager.LayoutParams params;
        params = new WindowManager.LayoutParams(
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
                PixelFormat.TRANSLUCENT);
        WindowManager windowManager = (WindowManager) context.getSystemService(Context.WINDOW_SERVICE);
        //获取屏幕的高度
        DisplayMetrics dm = new DisplayMetrics();
        windowManager.getDefaultDisplay().getMetrics(dm);
        int width = dm.widthPixels;
        int height = dm.heightPixels;
        params.format = PixelFormat.RGBA_8888;
        params.gravity = Gravity.LEFT | Gravity.TOP;
        GridView layout = new GridView(context);
        layout.setBackgroundColor(Color.RED);
        AppItemAdapter appItemAdapter = new AppItemAdapter(context);
        layout.setAdapter(appItemAdapter);
        AppDatabase appDatabase=new AppDatabase(context);
        List<AppItem> appItems = appDatabase.listAll();
        if (appItems.isEmpty()) {
            AppItem appItem = new AppItem();
            appItem.packageName = "com.android.settings";
            appItems.add(appItem);
        }
        appItemAdapter.updateApps(appItems);
        layout.setNumColumns(3);
        FrameLayout.LayoutParams layoutParams = new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);
        int margin = max(width, height) / 8; //dpToPx(context, 30);
        if (width > height)
            layoutParams.setMargins(margin << 1, margin, margin << 1, margin);
        else
            layoutParams.setMargins(margin >> 1, margin << 1, margin >> 1, margin << 1);
        layout.setLayoutParams(layoutParams);
        params.width = width - margin;
        params.height = height - margin >> 1;
        params.gravity = Gravity.CENTER;
        windowManager.addView(layout, params);
        layout.setOnItemClickListener(new OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                AppItem item = appItemAdapter.getItem(position);
                appDatabase.updateViews(item.packageName);
                Intent intent = context.getPackageManager().getLaunchIntentForPackage(item.packageName);
                context.startActivity(intent);
                windowManager.removeView(layout);
            }
        });


    }

    public static class ViewHolder {
        public TextView title;
        public ImageView thumbnail;
    }

    public static class AppItem {
        public String thumbnail;
        public String packageName;
        public String flag;
    }

    public static class AppItemAdapter extends BaseAdapter {
        private final List<AppItem> mAppItems = new ArrayList<>();
        private final Context mContext;
        private PackageManager mPackageManager;

        public AppItemAdapter(Context context) {
            mContext = context;
            mPackageManager = mContext.getPackageManager();
        }

        public void updateApps(List<AppItem> appItems) {
            mAppItems.clear();
            mAppItems.addAll(appItems);
            notifyDataSetChanged();
        }

        @Override
        public int getCount() {
            return mAppItems.size();
        }

        @Override
        public AppItem getItem(int position) {
            return mAppItems.get(position);
        }

        @Override
        public long getItemId(int position) {
            return 0;
        }

        @Override
        public View getView(int position, View convertView, ViewGroup parent) {
            ViewHolder viewHolder;
            if (convertView == null) {
                LinearLayout linearLayout = new LinearLayout(mContext);
                linearLayout.setPadding(24, 24, 24, 24);
                linearLayout.setOrientation(LinearLayout.VERTICAL);
                LinearLayout.LayoutParams layoutParams = new LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);
                linearLayout.setLayoutParams(layoutParams);
                viewHolder = new ViewHolder();
                viewHolder.thumbnail = new ImageView(mContext);
                LinearLayout.LayoutParams l = new LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
                l.gravity = Gravity.CENTER;
                linearLayout.addView(viewHolder.thumbnail, l);
                viewHolder.title = new TextView(mContext);
                viewHolder.title.setGravity(Gravity.CENTER);
                linearLayout.addView(viewHolder.title, new LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));
                convertView = linearLayout;
                convertView.setTag(viewHolder);
            } else {
                viewHolder = (ViewHolder) convertView.getTag();
            }
            AppItem appItem = mAppItems.get(position);
            Log.e("B5aOx2", String.format("getView, %s", appItem.packageName));
            try {
                ApplicationInfo applicationInfo = mPackageManager.getApplicationInfo(appItem.packageName, 0);
                CharSequence label = mPackageManager.getApplicationLabel(applicationInfo);
                viewHolder.title.setText(label);
                Drawable drawable = mPackageManager.getApplicationIcon(appItem.packageName);
                viewHolder.thumbnail.setBackground(drawable);
            } catch (NameNotFoundException e) {
            }
            return convertView;
        }
    }

    public static class AppDatabase extends SQLiteOpenHelper {

        public AppDatabase(Context context) {
            super(context, context.getDatabasePath("app.db").getPath(), null, 1);
        }

        public void delete(String packageName) {
            getWritableDatabase().delete("app", "package_name = ?", new String[]{packageName});
        }

        public void insert(String packageName) {
            Cursor cursor = getReadableDatabase().rawQuery("select * from app where package_name = ?", new String[]{
                    packageName
            });
            if (cursor.moveToNext()) {
                cursor.close();
                delete(packageName);
                return;
            }
            ContentValues values = new ContentValues();
            values.put("package_name", packageName);
            values.put("create_at", System.currentTimeMillis());
            getWritableDatabase().insert("app", null, values);
        }

        public List<AppItem> listAll() {
            Cursor cursor = getReadableDatabase().rawQuery("select package_name from app order by views desc", null);
            List<AppItem> apps = new ArrayList<>();
            while (cursor.moveToNext()) {
                AppItem appItem = new AppItem();
                appItem.packageName = cursor.getString(0);
                apps.add(appItem);
            }
            cursor.close();
            return apps;
        }

        public void updateViews(String packageName) {
            getWritableDatabase().execSQL("UPDATE app SET views = COALESCE(views,0) + 1 WHERE package_name = ?", new String[]{packageName});
        }

        @Override
        public void onCreate(SQLiteDatabase db) {
            db.execSQL("create table if not exists app(_id integer primary key,package_name text unique,flag text,views integer, create_at integer) ");
        }

        @Override
        public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        }
    }
}