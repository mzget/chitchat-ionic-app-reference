//
//  VoiceCallViewController.swift
//  ChitChat
//
//  Created by Prathan B. on 1/27/16.
//
//

import UIKit

class VoiceCallViewController: UIViewController  {
    
    var hangUpCallback: (() -> Void)?
    var contactId = [String:String]()
    
    @IBOutlet weak var callerImage: UIImageView!
    @IBOutlet weak var callerName: UILabel!
    @IBOutlet weak var callStatus: UILabel!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        
        let avatar_url:String = "http://203.113.25.44" + contactId["image"]!
        
        callerName.text = contactId["displayname"]
        callStatus.text = ""
        callerImage.hnk_setImageFromURL(NSURL(string: avatar_url)!)
        
        // Do any additional setup after loading the view, typically from a nib.
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    @IBAction func hangUp(sender: UIButton) {
        
        print("hangUp event")
        
        dismissViewControllerAnimated(true, completion: hangUpCallback)
    }
}