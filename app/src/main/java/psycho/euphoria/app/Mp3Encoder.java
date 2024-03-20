package psycho.euphoria.app;

public class Mp3Encoder {

    public static native int native_encoder_init(int inSampleRate, int outSampleRate, int outChannel,
                                                 int outBitRate, int quality);

    public static native int native_encoder_process(short[] inBuffer, int numOfSamples,
                                                    byte[] outBuffer, int size);

    public static native void native_encoder_flush(byte[] mp3Buffer);

    public static native void native_encoder_close();

}
