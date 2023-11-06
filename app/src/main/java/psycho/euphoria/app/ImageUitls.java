package psycho.euphoria.app;

import android.graphics.Bitmap;
import android.graphics.Bitmap.CompressFormat;
import android.graphics.Bitmap.Config;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.text.Layout;
import android.text.StaticLayout;
import android.text.TextPaint;

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Random;

public class ImageUitls {
    public static Bitmap applyFleaEffect(Bitmap source, int percentNoise) {
        // get source image size
        int width = source.getWidth();
        int height = source.getHeight();
        int[] pixels = new int[width * height];
        // get pixel array from source
        source.getPixels(pixels, 0, width, 0, 0, width, height);
        // create a random object
        Random random = new Random();
        int index = 0;
        // Note: Declare the c and randColor variables outside of the for loops
        int c = 0;
        int randColor = 0;
        // iterate through pixels
        for (int y = 0; y < height; ++y) {
            for (int x = 0; x < width; ++x) {
                if (random.nextInt(101) < percentNoise) {
                    // Skip this iteration a certain percentage of the time
                    continue;
                }
                // get current index in 2D-matrix
                index = y * width + x;
                // get random color
                c = random.nextInt(255);
                randColor = Color.rgb(c, c, c);
                pixels[index] |= randColor;
            }
        }
        Bitmap bmOut = Bitmap.createBitmap(width, height, source.getConfig());
        bmOut.setPixels(pixels, 0, width, 0, 0, width, height);
        return bmOut;
    }

    public static void drawText(String text, String outPath) throws IOException {
        int width = 800;
        int padding = 32;
        TextPaint paint = new TextPaint();
        paint.setColor(Color.BLACK);
        paint.setTextSize(32);
        StaticLayout.Builder sb = StaticLayout.Builder.obtain(text, 0, text.length(), paint, width)
                .setAlignment(Layout.Alignment.ALIGN_NORMAL)
                .setLineSpacing(1, 0)
                .setIncludePad(false);
        StaticLayout layout = sb.build();
        Bitmap bitmap = Bitmap.createBitmap(width + padding * 2, layout.getHeight() + padding * 2, Config.ARGB_8888);
        Canvas canvas = new Canvas(bitmap);
        canvas.translate(padding, padding);
        layout.draw(canvas);
        OutputStream out = new FileOutputStream(outPath);
        bitmap.compress(CompressFormat.JPEG, 80, out);
        out.close();
    }
}