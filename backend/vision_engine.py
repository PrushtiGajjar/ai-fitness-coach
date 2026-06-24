import cv2
import mediapipe as mp
import numpy as np

# Initialize MediaPipe Pose components
mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose

def calculate_angle(a, b, c):
    """
    Calculate the angle between three points.
    a: first point [x, y]
    b: middle point [x, y]
    c: end point [x, y]
    """
    a = np.array(a) # First
    b = np.array(b) # Mid
    c = np.array(c) # End
    
    # Calculate radians and convert to degrees
    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    
    # Angles should not exceed 180 degrees
    if angle > 180.0:
        angle = 360 - angle
        
    return angle

def main():
    # 0 is usually the default built-in webcam
    cap = cv2.VideoCapture(0)
    
    # Workout tracking variables
    squat_count = 0 
    stage = None # Can be 'up' or 'down'
    
    print("Starting AI Fitness Coach Camera... Press 'q' to quit.")
    
    # Setup MediaPipe instance
    with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                print("Failed to grab frame")
                break
            
            # MediaPipe requires RGB images, but OpenCV reads in BGR
            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image.flags.writeable = False
          
            # Make pose detection
            results = pose.process(image)
        
            # Recolor back to BGR for OpenCV to display
            image.flags.writeable = True
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
            
            # Extract landmarks for angle calculation
            try:
                landmarks = results.pose_landmarks.landmark
                
                # Get coordinates for the Left Leg (Hip, Knee, Ankle)
                # These coordinates are normalized [0.0, 1.0], representing percentages of the image dimensions
                hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x, landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
                knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x, landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y]
                ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x, landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
                
                # Calculate knee angle
                angle = calculate_angle(hip, knee, ankle)
                
                # Visualize the angle at the knee
                # We multiply by image dimensions to get actual pixel coordinates
                knee_coords = tuple(np.multiply(knee, [640, 480]).astype(int))
                cv2.putText(image, str(int(angle)), 
                            knee_coords, 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2, cv2.LINE_AA)
                
                # Squat counter logic
                # When angle > 160, the person is standing up straight
                if angle > 160:
                    stage = "up"
                # When angle < 90, the person is in a squat position
                if angle < 90 and stage == 'up':
                    stage = "down"
                    squat_count += 1
                    print(f"Squat completed! Total reps: {squat_count}")
                       
            except Exception as e:
                # Passes if no body is detected in the frame
                pass
            
            # UI: Render a status box on the top left
            cv2.rectangle(image, (0,0), (250,73), (245,117,16), -1)
            
            # Render Rep data
            cv2.putText(image, 'REPS', (15,12), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,0,0), 1, cv2.LINE_AA)
            cv2.putText(image, str(squat_count), 
                        (10,60), 
                        cv2.FONT_HERSHEY_SIMPLEX, 2, (255,255,255), 2, cv2.LINE_AA)
            
            # Render Stage data (Up or Down)
            cv2.putText(image, 'STAGE', (90,12), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,0,0), 1, cv2.LINE_AA)
            cv2.putText(image, stage if stage else "-", 
                        (90,60), 
                        cv2.FONT_HERSHEY_SIMPLEX, 2, (255,255,255), 2, cv2.LINE_AA)
            
            # Render pose connections (the "skeleton")
            if results.pose_landmarks:
                mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                                        mp_drawing.DrawingSpec(color=(245,117,66), thickness=2, circle_radius=2), 
                                        mp_drawing.DrawingSpec(color=(245,66,230), thickness=2, circle_radius=2))               
            
            # Show the video feed
            cv2.imshow('AI Fitness Coach - Squat Tracker', image)

            # Break the loop if 'q' is pressed
            if cv2.waitKey(10) & 0xFF == ord('q'):
                break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == '__main__':
    main()
