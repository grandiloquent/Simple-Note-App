package psycho.euphoria.app;

import android.app.admin.DevicePolicyManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;

public class LockScreenManager {

    private DevicePolicyManager devicePolicyManager;
    private ComponentName adminComponent;
    private Context context;

    public LockScreenManager(Context context) {
        this.context = context;
        devicePolicyManager = (DevicePolicyManager) context.getSystemService(Context.DEVICE_POLICY_SERVICE);
        adminComponent = new ComponentName(context, DeviceAdminReceiver.class); // Ensure you have a DeviceAdminReceiver
    }

    public boolean isAdminActive() {
        return devicePolicyManager.isAdminActive(adminComponent);
    }

    public void requestAdminPermission() {
        Intent intent = new Intent(DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN);
        intent.putExtra(DevicePolicyManager.EXTRA_DEVICE_ADMIN, adminComponent);
        intent.putExtra(DevicePolicyManager.EXTRA_ADD_EXPLANATION, "This app requires device admin permission to lock the screen.");
        context.startActivity(intent);
    }

    public void lockScreen() {
        if (isAdminActive()) {
            devicePolicyManager.lockNow();
        } else {
            requestAdminPermission(); // Request permissions before locking
        }
    }

    public static class DeviceAdminReceiver extends android.app.admin.DeviceAdminReceiver {
        // Implement necessary methods if needed
    }
}