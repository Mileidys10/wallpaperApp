package io.ionic.starter;

import android.Manifest;
import android.app.WallpaperManager;
import android.content.Context;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Build;
import android.util.Log;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@CapacitorPlugin(
  name = "Wallpaper",
  permissions = {
    @Permission(strings = {
      Manifest.permission.SET_WALLPAPER,
      Manifest.permission.READ_EXTERNAL_STORAGE
    }, alias = "wallpaper")
  }
)
public class WallpaperPlugin extends Plugin {

  private static final String TAG = "WallpaperPlugin";
  private static final String PERMISSION_DENIED = "Permission denied to set wallpaper";
  private static final String WALLPAPER_SET_ERROR = "Error setting wallpaper";
  private static final String INVALID_IMAGE_PATH = "Invalid image path";

  @PluginMethod
  public void setHomeScreenWallpaper(PluginCall call) {
    setWallpaperInternal(call, WallpaperManager.FLAG_SYSTEM, "home screen");
  }

  @PluginMethod
  public void setLockScreenWallpaper(PluginCall call) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N) {
      call.reject("Lock screen wallpaper is only supported on Android 7.0 (API 24) and above");
      return;
    }
    setWallpaperInternal(call, WallpaperManager.FLAG_LOCK, "lock screen");
  }

  @PluginMethod
  public void setBothWallpaper(PluginCall call) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
      setWallpaperInternal(call, WallpaperManager.FLAG_SYSTEM | WallpaperManager.FLAG_LOCK, "both screens");
    } else {
      setWallpaperInternal(call, -1, "both screens");
    }
  }

  private void setWallpaperInternal(PluginCall call, int flags, String screenType) {
    String imagePath = call.getString("imagePath");

    Log.d(TAG, "Setting wallpaper for " + screenType + " with path: " + imagePath);

    if (imagePath == null || imagePath.isEmpty()) {
      call.reject(INVALID_IMAGE_PATH);
      return;
    }

    // Verificar permisos antes de proceder
    if (!hasAllWallpaperPermissions()) {
      Log.e(TAG, "Missing wallpaper permissions");
      call.reject(PERMISSION_DENIED + ". Please check app permissions in Settings.");
      return;
    }

    try {
      Bitmap bitmap = loadBitmapFromPath(imagePath);
      if (bitmap == null) {
        call.reject("Failed to load image from path: " + imagePath);
        return;
      }

      WallpaperManager wallpaperManager = WallpaperManager.getInstance(getContext());

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N && flags != -1) {
        wallpaperManager.setBitmap(bitmap, null, true, flags);
      } else {
        // Para versiones anteriores o cuando flags es -1
        wallpaperManager.setBitmap(bitmap);
      }

      JSObject ret = new JSObject();
      ret.put("success", true);
      ret.put("message", "Wallpaper set successfully for " + screenType);
      call.resolve(ret);

      Log.d(TAG, "Wallpaper set successfully for " + screenType);

    } catch (IOException e) {
      Log.e(TAG, "IOException setting wallpaper: " + e.getMessage());
      call.reject(WALLPAPER_SET_ERROR + ": " + e.getMessage());
    } catch (SecurityException e) {
      Log.e(TAG, "SecurityException setting wallpaper: " + e.getMessage());
      call.reject(PERMISSION_DENIED + ": " + e.getMessage());
    } catch (Exception e) {
      Log.e(TAG, "Unexpected error setting wallpaper: " + e.getMessage());
      call.reject("Unexpected error: " + e.getMessage());
    }
  }

  @PluginMethod
  public void checkPermissions(PluginCall call) {
    JSObject ret = new JSObject();
    boolean hasSetWallpaper = hasSetWallpaperPermission();
    boolean hasReadStorage = hasReadStoragePermission();

    ret.put("granted", hasSetWallpaper && hasReadStorage);
    ret.put("setWallpaper", hasSetWallpaper);
    ret.put("readStorage", hasReadStorage);

    Log.d(TAG, "Permissions check - SET_WALLPAPER: " + hasSetWallpaper + ", READ_STORAGE: " + hasReadStorage);

    call.resolve(ret);
  }

  @PluginMethod
  public void requestPermissions(PluginCall call) {
    if (hasAllWallpaperPermissions()) {
      JSObject ret = new JSObject();
      ret.put("granted", true);
      call.resolve(ret);
      return;
    }

    // Solicitar permisos
    String[] permissions = getNeededPermissions();

    if (permissions.length > 0) {
      Log.d(TAG, "Requesting permissions: " + String.join(", ", permissions));
      ActivityCompat.requestPermissions(getActivity(), permissions, 1001);

      // El resultado se manejará en handleRequestPermissionsResult
      saveCall(call);
    } else {
      JSObject ret = new JSObject();
      ret.put("granted", true);
      call.resolve(ret);
    }
  }

  @Override
  protected void handleRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
    super.handleRequestPermissionsResult(requestCode, permissions, grantResults);

    Log.d(TAG, "Permission result received for request code: " + requestCode);

    PluginCall savedCall = getSavedCall();
    if (savedCall == null) {
      Log.w(TAG, "No saved call found for permission result");
      return;
    }

    JSObject ret = new JSObject();
    boolean allGranted = true;

    for (int result : grantResults) {
      if (result != PackageManager.PERMISSION_GRANTED) {
        allGranted = false;
        break;
      }
    }

    ret.put("granted", allGranted);
    Log.d(TAG, "All permissions granted: " + allGranted);
    savedCall.resolve(ret);
  }

  private boolean hasAllWallpaperPermissions() {
    return hasSetWallpaperPermission() && hasReadStoragePermission();
  }

  private boolean hasSetWallpaperPermission() {
    return ContextCompat.checkSelfPermission(getContext(), Manifest.permission.SET_WALLPAPER)
      == PackageManager.PERMISSION_GRANTED;
  }

  private boolean hasReadStoragePermission() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      // Android 13+ usa READ_MEDIA_IMAGES
      return ContextCompat.checkSelfPermission(getContext(), "android.permission.READ_MEDIA_IMAGES")
        == PackageManager.PERMISSION_GRANTED;
    } else {
      // Versiones anteriores usan READ_EXTERNAL_STORAGE
      return ContextCompat.checkSelfPermission(getContext(), Manifest.permission.READ_EXTERNAL_STORAGE)
        == PackageManager.PERMISSION_GRANTED;
    }
  }

  private String[] getNeededPermissions() {
    java.util.List<String> permissions = new java.util.ArrayList<>();

    if (!hasSetWallpaperPermission()) {
      permissions.add(Manifest.permission.SET_WALLPAPER);
    }

    if (!hasReadStoragePermission()) {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        permissions.add("android.permission.READ_MEDIA_IMAGES");
      } else {
        permissions.add(Manifest.permission.READ_EXTERNAL_STORAGE);
      }
    }

    return permissions.toArray(new String[0]);
  }

  private Bitmap loadBitmapFromPath(String imagePath) {
    Log.d(TAG, "Loading bitmap from path: " + imagePath);

    try {
      Context context = getContext();
      InputStream inputStream = null;

      if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        // Cargar desde URL
        URL url = new URL(imagePath);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setDoInput(true);
        connection.connect();
        inputStream = connection.getInputStream();

      } else if (imagePath.startsWith("content://") || imagePath.startsWith("file://")) {
        // Cargar desde URI
        Uri uri = Uri.parse(imagePath);
        inputStream = context.getContentResolver().openInputStream(uri);

      } else if (imagePath.startsWith("/")) {
        // Ruta absoluta
        return BitmapFactory.decodeFile(imagePath);

      } else {
        // Asset relativo
        inputStream = context.getAssets().open(imagePath);
      }

      if (inputStream != null) {
        Bitmap bitmap = BitmapFactory.decodeStream(inputStream);
        inputStream.close();

        if (bitmap != null) {
          Log.d(TAG, "Bitmap loaded successfully. Size: " + bitmap.getWidth() + "x" + bitmap.getHeight());
        } else {
          Log.e(TAG, "Failed to decode bitmap from stream");
        }

        return bitmap;
      }
    } catch (FileNotFoundException e) {
      Log.e(TAG, "File not found: " + e.getMessage());
    } catch (IOException e) {
      Log.e(TAG, "IO error loading bitmap: " + e.getMessage());
    } catch (Exception e) {
      Log.e(TAG, "Unexpected error loading bitmap: " + e.getMessage());
    }

    Log.e(TAG, "Failed to load bitmap from path: " + imagePath);
    return null;
  }
}
