package psycho.euphoria.app;


import android.app.ActivityManager;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.media.MediaScannerConnection;
import android.os.CountDownTimer;
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

import java.io.BufferedWriter;
import java.io.ByteArrayOutputStream;
import java.io.Closeable;
import java.io.DataOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.DatagramSocket;
import java.net.HttpURLConnection;
import java.net.Socket;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

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

    public static boolean checkProcessForKill(String[] packages, String s) {
        for (String aPackage : packages) {
            if (s.contains(aPackage)) return true;
        }
        return false;
    }

    public static void closeSilently(Object... xs) {
        // Note: on Android API levels prior to 19 Socket does not implement Closeable
        for (Object x : xs) {
            if (x != null) {
                try {
                    if (x instanceof Closeable) {
                        ((Closeable) x).close();
                    } else if (x instanceof Socket) {
                        ((Socket) x).close();
                    } else if (x instanceof DatagramSocket) {
                        ((DatagramSocket) x).close();
                    } else {
                        throw new RuntimeException("cannot close " + x);
                    }
                } catch (Throwable e) {
                }
            }
        }
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

    public static void drawFromClipboard(Context context) {
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMdd_hhmmss");
        String name = dateFormat.format(new Date()) + ".jpg";
        File file = new File("/storage/emulated/0/Books", name);
        try {
            ImageUitls.drawText(Shared.getText(context).toString(), file.getAbsolutePath());
            MediaScannerConnection.scanFile(
                    context, new String[]{file.getAbsolutePath()}, new String[]{
                            "image/*",
                            "video/*"
                    }, null
            );
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public static Rectangle getImageSize(String imageUri) {
        BitmapFactory.Options options = new BitmapFactory.Options();
        options.inJustDecodeBounds = true;
        File imageFile = new File(imageUri);
        BitmapFactory.decodeFile(imageFile.getAbsolutePath(), options);
        return new Rectangle(options.outWidth, options.outHeight);
    }

    public static void killProcess(int pid) {
        try {
            Process rootProcess = Runtime.getRuntime().exec(new String[]{"su"});
            String command = "kill -9 " + pid;
            BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(rootProcess.getOutputStream()), 2048);
            try {
                bw.write(command);
                bw.newLine();
                bw.flush();
            } catch (IOException e) {
                // Handle error
            }
        } catch (Exception e) {
            e.printStackTrace();
            // Device not rooted!
        }
    }

    public static void killProcesses(String[] packages) {
        String[] results = Utils.sudoForResult("ps -A").split("\n");
        Pattern pattern = Pattern.compile("\\s+\\d+\\s+");
        for (String result : results) {
            if (checkProcessForKill(packages, result)) {
                Matcher matcher = pattern.matcher(result);
                if (matcher.find()) {
                    killProcess(Integer.parseInt(matcher.group().trim()));
                }
            }
        }
    }

    public static void killProcesses(String baseUrl) {
        killProcesses(new String[]{"com.icbc",
                "com.android.nfc",
                "nekox.messenger",

                "com.goodix.fingerprint",
                "com.android.camera",

                "com.chinasofti.shanghaihuateng.metroapp",
                 "com.icbc", "com.jeffmony.videodemo",
                "com.miui.screenrecorder", "com.speedsoftware.rootexplorer",
                "com.tencent.qqmusic",
                "com.yueme.itv", "euphoria.psycho.browser",
                "euphoria.psycho.fileserver", "euphoria.psycho.knife",
                "euphoria.psycho.lynda", "euphoria.psycho.porn",
                "euphoria.psycho.server","org.readera",
                "org.telegram.messenger", "psycho.euphoria.editor",
                "psycho.euphoria.source", "psycho.euphoria.notepad",
                "psycho.euphoria.plane", "psycho.euphoria.reader",
                "psycho.euphoria.translator", "psycho.euphoria.unknown",
                "psycho.euphoria.video", "psycho.euphoria.viewer", "com.moez.QKSMS",
                "com.android.stopwatch", "com.autonavi.minimap", "com.duokan.readex",

                "com.tencent.qqmusic",

                "nekox.messenger",
                "com.azure.authenticator",
                "com.tencent.mobileqq",
                "com.xiaomi.account",
                "sv.mftv"
        });
        new Thread(() -> {
            String url = Shared.substringBeforeLast(baseUrl, "/") + "/kill";
            try {
                HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
                c.setRequestMethod("POST");
                OutputStreamWriter wr = new OutputStreamWriter(c.getOutputStream());
                wr.write(new JSONArray(new String[]{
                        "com.baidu.input_yijia",
                        "com.tencent.mm",
                        "com.android.chrome",
                        "org.mozilla.firefox",
                        "sv.mftv",
                        "com.v2ray.ang",
                        "cn.yonghui.hyd",
                        "com.jingdong.app.mall",
                        "com.eg.android.AlipayGphone",
                        "euphoria.psycho.browser",
                        "psycho.euphoria.v",
                        "com.android.settings",
                        "com.zhiliaoapp.musically",
                        "psycho.euphoria.app"
                }).toString());
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

    public static String readFully(InputStream is) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        byte[] buffer = new byte[1024];
        int length = 0;
        while ((length = is.read(buffer)) != -1) {
            baos.write(buffer, 0, length);
        }
        return baos.toString("UTF-8");
    }

    public static String sudoForResult(String... strings) {
        String res = "";
        DataOutputStream outputStream = null;
        InputStream response = null;
        try {
            Process su = Runtime.getRuntime().exec(new String[]{"su"});
            outputStream = new DataOutputStream(su.getOutputStream());
            response = su.getInputStream();
//
//            for (String s : strings) {
            outputStream.writeBytes("ps -A\n");
            outputStream.flush();
//            }
//
            outputStream.writeBytes("exit\n");
            outputStream.flush();
//            try {
//                su.waitFor();
//            } catch (InterruptedException e) {
//                e.printStackTrace();
//            }
            res = readFully(response);
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            closeSilently(outputStream, response);
        }
        return res;
    }

    private static void addPageNumber(Rectangle documentRect, PdfWriter writer) {
        ColumnText.showTextAligned(writer.getDirectContent(),
                Element.ALIGN_BOTTOM,
                new Phrase(String.format("%d", writer.getPageNumber())),
                ((documentRect.getRight() + documentRect.getLeft()) / 2),
                documentRect.getBottom() + 25, 0);
    }

    public static void takePhoto() {
        ServerService.openCamera();
        new CountDownTimer(30000, 1000) {
            public void onTick(long millisUntilFinished) {
                ServerService.takePhoto();
            }

            public void onFinish() {
                ServerService.deleteCamera();
            }
        }.start();
    }
}