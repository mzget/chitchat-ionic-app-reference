//
//  ReceiveCallController.swift
//  ChitChat
//
//  Created by Prathan B. on 2/19/16.
//
//

import UIKit
import AVFoundation

class ReceiveCallViewController: UIViewController {
    
    var audioPlayer = AVAudioPlayer()
    var answerCallback: (() -> Void)?
    var declineCallback: (() -> Void)?
    var contactId = [String:String]()
    
    @IBOutlet weak var callerImage: UIImageView!
    @IBOutlet weak var callerName: UILabel!
    @IBOutlet weak var callStatus: UILabel!
    
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        
        let avatar_url:String = "http://203.113.25.44" + contactId["image"]!
        
        callerName.text = contactId["displayname"]
        callStatus.text = "Incoming call..."
        //callerImage.hnk_setImageFromURL(NSURL(string: avatar_url)!)
        
        let audioPath = NSBundle.mainBundle().pathForResource("iphone", ofType: "mp3")
        
        do {
            audioPlayer = try AVAudioPlayer(contentsOfURL: NSURL(fileURLWithPath: audioPath!))
            audioPlayer.numberOfLoops = -1
            audioPlayer.play()
        }
        catch {
            print("Something bad happened. Try catching specific errors to narrow things down")
        }
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    
    @IBAction func doAnswer(sender: UIButton) {
        audioPlayer.stop()
        dismissViewControllerAnimated(true, completion: answerCallback)
    }
    
    @IBAction func doDecline(sender: UIButton) {
        audioPlayer.stop()
        dismissViewControllerAnimated(true, completion: declineCallback)
    }
    
    func hangup()
    {
        dismissViewControllerAnimated(true, completion: declineCallback)
    }
    
}