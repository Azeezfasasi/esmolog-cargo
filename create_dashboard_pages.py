import os
from pathlib import Path

# Mapping of routes to component names
routes = {
    'myshipments': 'MyShipmentMain',
    'createshipment': 'CreateShipmentMain',
    'archived-shipments': 'DeliveredShipmentMain',
    'manage-shipment-status': 'ManageShipmentStatusMain',
    'manage-facility': 'ManageFacilityMain',
    'trackshipment': 'TrackShipmentMain',
    'contactformresponses': 'ContactFormResponsesMain',
    'allposts': 'AllPostsMain',
    'allblogpost': 'ManageBlogPosts',
    'addnewpost': 'AddNewPostMain',
    'allevents': 'ManageEvents',
    'addevent': 'AddEventMain',
    'myappointments': 'MyAppointmentMain',
    'bookappointment': 'BookAppointMain',
    'allappointments': 'AllAppointmentsMain',
    'sendnewsletter': 'SendNewsletterMain',
    'allnewsletter': 'ManageNewsletter',
    'Newslettersubscribers': 'NewsletterSubscribersMain',
    'allgalleryimages': 'GalleryManager',
    'addnewgallery': 'GalleryUploadForm',
    'allusers': 'AllUserMain',
    'addnewuser': 'AddNewUserMain',
    'changeuserpassword': 'ChangeUserPasswordMain',
    'profile': 'ProfileMain',
    'manage-message-slides': 'ServicesSlidesManager',
    'manage-hero-slides': 'HeroSlidesManager',
    'manage-our-services': 'ServicesSlidesManager'
}

base_path = r'c:\Users\User\Desktop\React Dev\cargo new\src\app\dashboard'

created_count = 0
for route, component in routes.items():
    route_path = Path(base_path) / route
    route_path.mkdir(parents=True, exist_ok=True)
    
    page_content = f"""import {component} from '@/components/DashboardComponents/{component}'

export default function Page() {{
  return <{component} />
}}
"""
    
    page_file = route_path / 'page.js'
    page_file.write_text(page_content)
    created_count += 1
    print(f"Created {route}/page.js")

print(f"\nTotal: {created_count} page files created!")
