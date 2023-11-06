package psycho.euphoria.app;


import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.util.Log;
import android.view.inputmethod.InputMethodManager;
import android.widget.Toast;

import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Document;
import com.itextpdf.text.Element;
import com.itextpdf.text.Image;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.Rectangle;
import com.itextpdf.text.pdf.ColumnText;
import com.itextpdf.text.pdf.PdfWriter;

import org.json.JSONArray;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.List;

public class Utils {
    public static Rectangle calculateCommonPageSize(List<String> imagesUri) {
        float maxWidth = 0;
        float maxHeight = 0;
        for (String imageUri : imagesUri) {
            Rectangle imageSize = getImageSize(imageUri);
            float imageWidth = imageSize.getWidth();
            float imageHeight = imageSize.getHeight();
            if (imageWidth > maxWidth) maxWidth = imageWidth;
            if (imageHeight > maxHeight) maxHeight = imageHeight;
        }
        return new Rectangle(maxWidth, maxHeight);
    }

    public static void createPdfFromImages(String path, List<String> images, float marginLeft, float marginRight,
                                           float marginTop, float marginBottom) {
        Rectangle pageSize = calculateCommonPageSize(images);
        pageSize.setBackgroundColor(new BaseColor(255, 255, 255
        ));
        Document document = new Document(pageSize,
                marginLeft, marginRight, marginTop, marginBottom);
        document.setMargins(marginLeft, marginRight, marginTop, marginBottom);
        Rectangle documentRect = document.getPageSize();
        try {
            PdfWriter writer = PdfWriter.getInstance(document, new FileOutputStream(path));
            document.open();
            for (int i = 0; i < images.size(); i++) {
                int quality;
                quality = 30;
                Image image = Image.getInstance(images.get(i));
                // compressionLevel is a value between 0 (best speed) and 9 (best compression)
                double qualityMod = quality * 0.09;
                image.setCompressionLevel((int) qualityMod);
                image.setBorder(Rectangle.BOX);
                image.setBorderWidth(1);
                BitmapFactory.Options bmOptions = new BitmapFactory.Options();
                Bitmap bitmap = BitmapFactory.decodeFile(images.get(i), bmOptions);
                float pageWidth = document.getPageSize().getWidth() - (marginLeft + marginRight);
                float pageHeight = document.getPageSize().getHeight() - (marginBottom + marginTop);
                image.scaleToFit(pageWidth, pageHeight);
                image.setAbsolutePosition(
                        (documentRect.getWidth() - image.getScaledWidth()) / 2,
                        (documentRect.getHeight() - image.getScaledHeight()) / 2);
                addPageNumber(documentRect, writer);
                document.add(image);
                document.newPage();
            }
            document.close();
        } catch (Exception e) {
        }

    }

    public static Rectangle getImageSize(String imageUri) {
        BitmapFactory.Options options = new BitmapFactory.Options();
        options.inJustDecodeBounds = true;
        File imageFile = new File(imageUri);
        BitmapFactory.decodeFile(imageFile.getAbsolutePath(), options);
        return new Rectangle(options.outWidth, options.outHeight);
    }

    public static void killProcesses(String baseUrl) {
        new Thread(() -> {
            String url = Shared.substringBeforeLast(baseUrl, "/") + "/kill";
            try {
                HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
                c.setRequestMethod("POST");
                OutputStreamWriter wr = new OutputStreamWriter(c.getOutputStream());
                String[] packages = new String[]{
                        "com.android.camera", "com.android.chrome",
                        "com.android.settings", "com.baidu.input_yijia",
                        "com.chinasofti.shanghaihuateng.metroapp",
                        "com.eg.android.AlipayGphone", "com.icbc", "com.jeffmony.videodemo",
                        "com.miui.screenrecorder", "com.speedsoftware.rootexplorer",
                        "com.tencent.mm", "com.tencent.qqmusic", "com.v2ray.ang",
                        "com.yueme.itv", "euphoria.psycho.browser",
                        "euphoria.psycho.fileserver", "euphoria.psycho.knife",
                        "euphoria.psycho.lynda", "euphoria.psycho.porn",
                        "euphoria.psycho.server", "org.mozilla.firefox", "org.readera",
                        "org.telegram.messenger", "psycho.euphoria.editor",
                        "psycho.euphoria.source", "psycho.euphoria.notepad",
                        "psycho.euphoria.plane", "psycho.euphoria.reader",
                        "psycho.euphoria.translator", "psycho.euphoria.unknown",
                        "psycho.euphoria.video", "psycho.euphoria.viewer", "com.moez.QKSMS",
                        "com.android.stopwatch", "com.autonavi.minimap", "com.duokan.readex",
                        "cn.yonghui.hyd",
                        "com.tencent.qqmusic",
                        "psycho.euphoria.v",
                        "psycho.euphoria.app",
                        "psycho.euphoria.app",
                        "nekox.messenger",
                        "com.jingdong.app.mall",
                        "com.azure.authenticator",
                        "com.tencent.mobileqq",
                        "com.xiaomi.account",
                        "psycho.euphoria.app"

                };
                wr.write(new JSONArray(packages).toString());
                wr.close();
                c.getResponseCode();
            } catch (Exception ignored) {
            }
        }).start();
    }

    public static void launchInputMethodPicker(Context context) {
        ((InputMethodManager) context.getSystemService(Context.INPUT_METHOD_SERVICE))
                .showInputMethodPicker();
    }

    private static void addPageNumber(Rectangle documentRect, PdfWriter writer) {
        ColumnText.showTextAligned(writer.getDirectContent(),
                Element.ALIGN_BOTTOM,
                new Phrase(String.format("%d", writer.getPageNumber())),
                ((documentRect.getRight() + documentRect.getLeft()) / 2),
                documentRect.getBottom() + 25, 0);
    }
}