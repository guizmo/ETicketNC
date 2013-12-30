//
//  CustomBarcodeViewController.h
//
//  Created by Christophe Fondacci on 27/12/13.
//
//  This little extension allows the ZXingWidgetController to appear below
// the (transparent) webview and to remain active after a scan.  

#import "ZXingWidgetController.h"

@class CDVPlugin;

@interface CustomBarcodeViewController : ZXingWidgetController <ZXingDelegate>

- (id)initWithPlugin:(CDVPlugin*)thePlugin callbackId:(NSString*)theCallbackId;
- (void) reset;

@end
