//
//  CDVBarcodeScanner.h
//  BarcodeScanner
//
//  Created by Jonathan Nunez Aguin on 30/09/2013.
//
//

#import <Foundation/Foundation.h>
#import <Cordova/CDVPlugin.h>

@interface CDVBarcodeScanner : CDVPlugin {
    
}

@property (nonatomic, copy) NSString* callbackId;

- (void)scan:(CDVInvokedUrlCommand*)command;

@end
