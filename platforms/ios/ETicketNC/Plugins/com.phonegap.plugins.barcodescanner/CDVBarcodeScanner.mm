//
//  CDVBarcodeScanner.mm
//  BarcodeScanner
//
//  Created by Jonathan Nunez Aguin on 30/09/2013.
//
// Modified by Christophe Fondacci so that the scan controller is placed below the webview
// and remains active after a scan. A new "dismiss" method could be explicitly called
// to dismiss the controller.
//
// Also note that after a successful scan, the control is passed back to JS through the success
// callback. Even if the barcode scanner remains visible, the JS need to make another call to "scan"
// again so that the controller will detect barcodes again.
//

#import "CDVBarcodeScanner.h"
#import "CustomBarcodeViewController.h"
#define SYSTEM_VERSION_LESS_THAN(v) ([[[UIDevice currentDevice] systemVersion] compare:v options:NSNumericSearch] == NSOrderedAscending)

@implementation CDVBarcodeScanner {
    
    // Custom controller
    CustomBarcodeViewController * widgetController;
}

@class OverlayView;
@synthesize callbackId = _callbackId;


- (void)scan:(CDVInvokedUrlCommand*)command{
    
    self.callbackId = command.callbackId;
    
    // We instantiate our barcode scanner controller only if not yet created
    if(widgetController == nil) {
        
        // Creating
        widgetController = [[CustomBarcodeViewController alloc] initWithPlugin:self callbackId:command.callbackId];
        // Presenting
        [self.viewController presentViewController:widgetController animated:YES completion:nil];
    }  else {
        // If we already have it, then we only reset it (i.e. prepare it for a new scan)
        [widgetController reset];
    }
}


- (void)dismiss:(CDVInvokedUrlCommand*)command{
    
    self.callbackId = command.callbackId;
    
    // Only if controller already instantiated
    if(widgetController != nil) {
        
        // Detaching webview
        [self.webView removeFromSuperview];
        
        // Dismissing barcode scanner controller
        [widgetController dismissViewControllerAnimated:YES completion:nil];
        
        // Reattaching webview
        if(SYSTEM_VERSION_LESS_THAN(@"7.0") && self.webView.frame.origin.y < 20) {
			CGRect frame = self.webView.frame;
	        //frame.size.height = frame.size.height + 20;
			self.webView.frame = CGRectOffset(frame, 0, 20);
		}
        [self.viewController.view addSubview:self.webView];
        
        // No current barcode scanner controller
        widgetController = nil;
    }
}

@end