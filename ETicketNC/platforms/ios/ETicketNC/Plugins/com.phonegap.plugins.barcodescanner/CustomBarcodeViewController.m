//
//  CustomBarcodeViewController.m
//
//  Created by Christophe Fondacci on 27/12/13.
//
//

#import "CustomBarcodeViewController.h"
#import <Cordova/CDVPlugin.h>

@interface CustomBarcodeViewController ()

@end

@implementation CustomBarcodeViewController {
    CDVPlugin *plugin;
    NSString *callbackId;
}

- (id)initWithPlugin:(CDVPlugin*)thePlugin callbackId:(NSString*)theCallbackId
{
    self = [super initWithDelegate:self showCancel:NO OneDMode:YES showLicense:NO];
    if (self) {
        plugin = thePlugin;
        callbackId = theCallbackId;
	[self setOverlayView:nil];
	// Unfortunately these lines have no effect
        plugin.webView.backgroundColor = [UIColor clearColor];
        plugin.webView.opaque=NO;
        
        // Uncomment to add sound
//        self.soundToPlay = [NSURL fileURLWithPath:[[NSBundle mainBundle] pathForResource:@"beep-beep" ofType:@"aiff"] isDirectory:NO];

    }
    return self;
}

-(void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:animated];
    [plugin.webView removeFromSuperview];
    [self.view addSubview:plugin.webView];
}
- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)returnSuccess:(NSString*)scannedText format:(NSString*)format cancelled:(BOOL)cancelled{
    
    NSNumber* cancelledNumber = [NSNumber numberWithInt:(cancelled?1:0)];
    
    NSMutableDictionary* resultDict = [[NSMutableDictionary alloc] init];
    [resultDict setObject:scannedText     forKey:@"text"];
    [resultDict setObject:format          forKey:@"format"];
    [resultDict setObject:cancelledNumber forKey:@"cancelled"];
    
    CDVPluginResult* result = [CDVPluginResult
                               resultWithStatus: CDVCommandStatus_OK
                               messageAsDictionary: resultDict
                               ];
    [result setKeepCallbackAsBool:YES];
    [plugin.commandDelegate sendPluginResult:result callbackId:callbackId];
}

- (void)returnError:(NSString*)message{
    
    CDVPluginResult* result = [CDVPluginResult
                               resultWithStatus: CDVCommandStatus_ERROR
                               messageAsString: message
                               ];
    
    [plugin.commandDelegate sendPluginResult:result callbackId:callbackId];
}

-(void) reset {
    decoding = YES;
//    [overlayView setPoints:nil];
    wasCancelled = NO;
}
#pragma mark -
#pragma mark ZXingDelegate

- (void)zxingController:(ZXingWidgetController*)controller didScanResult:(NSString *)result format: (NSString*)format{
    
    // No dismiss
    //    [self.viewController dismissModalViewControllerAnimated: YES];

    [self returnSuccess:result format:format cancelled: NO];
}

- (void)zxingControllerDidCancel:(ZXingWidgetController*)controller{
    
    // No dismiss
    //    [self.viewController dismissModalViewControllerAnimated: YES];
    
    [self returnSuccess:@"" format:@"" cancelled: YES];
}

- (BOOL)zxingController:(ZXingWidgetController*)controller shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation{
    
    return NO;
}
@end
