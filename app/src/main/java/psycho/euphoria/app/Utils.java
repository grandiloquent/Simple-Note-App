package psycho.euphoria.app;


import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.util.Log;

import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Document;
import com.itextpdf.text.Element;
import com.itextpdf.text.Image;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.Rectangle;
import com.itextpdf.text.pdf.ColumnText;
import com.itextpdf.text.pdf.PdfWriter;

import java.io.File;
import java.io.FileOutputStream;
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
        pageSize.setBackgroundColor(new BaseColor(
                Color.red(255),
                Color.green(255),
                Color.blue(255)
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

    private static void addPageNumber(Rectangle documentRect, PdfWriter writer) {
        ColumnText.showTextAligned(writer.getDirectContent(),
                Element.ALIGN_BOTTOM,
                new Phrase(String.format("%d", writer.getPageNumber())),
                ((documentRect.getRight() + documentRect.getLeft()) / 2),
                documentRect.getBottom() + 25, 0);
    }


}