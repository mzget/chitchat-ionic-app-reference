#import <Foundation/Foundation.h>
#import <CoreLocation/CoreLocation.h>
#import <CoreLocation/CLLocationManager.h>
#import <Cordova/CDVPlugin.h>

@interface IonicCameraRoll : CDVPlugin
{}

- (void)saveImageToCameraRoll:(CDVInvokedUrlCommand*)command;
- (void)saveVideoToCameraRoll:(CDVInvokedUrlCommand*)command;

@end
