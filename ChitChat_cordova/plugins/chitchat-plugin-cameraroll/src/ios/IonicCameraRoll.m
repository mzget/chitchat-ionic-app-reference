#import "IonicCameraRoll.h"
#import <AssetsLibrary/ALAssetRepresentation.h>
#import <CoreLocation/CoreLocation.h>

@implementation IonicCameraRoll

  + (ALAssetsLibrary *)defaultAssetsLibrary {
    static dispatch_once_t pred = 0;
    static ALAssetsLibrary *library = nil;
    dispatch_once(&pred, ^{
      library = [[ALAssetsLibrary alloc] init];
    });

    // TODO: Dealloc this later?
    return library;
  }
  
- (void)saveImageToCameraRoll:(CDVInvokedUrlCommand*)command
{
  NSString *uri = [command argumentAtIndex:0];
  NSURL *url = [NSURL URLWithString:uri];    
  NSData *imageData = [NSData dataWithContentsOfURL:url];
  UIImage *image = [UIImage imageWithData:imageData];

  // save the image to photo album
  UIImageWriteToSavedPhotosAlbum(image, nil, nil, nil);

  CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"saved"];
  [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)saveVideoToCameraRoll:(CDVInvokedUrlCommand*)command
{
    NSString *uri = [command argumentAtIndex:0];
    NSURL *srcURL = [NSURL URLWithString:uri];

    ALAssetsLibrary *library = [[ALAssetsLibrary alloc] init];
    ALAssetsLibraryWriteVideoCompletionBlock videoWriteCompletionBlock =
    ^(NSURL *newURL, NSError *error) {
        if (error) {
            NSLog( @"Error writing video with metadata to Library: %@", error );
        } else {
            NSLog( @"Wrote video with metadata to Library %@", newURL.absoluteString);
            
            CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"saved"];
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        }
    };

    if ([library videoAtPathIsCompatibleWithSavedPhotosAlbum:srcURL])
    {
        [library writeVideoAtPathToSavedPhotosAlbum:srcURL
                                    completionBlock:videoWriteCompletionBlock];
    }
}


@end

