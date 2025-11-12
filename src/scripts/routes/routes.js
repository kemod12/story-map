import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
// temporarily point to the repaired add-story page implementation
import AddStoryPage from '../pages/add-story/add-story-page';
import LoginPage from '../pages/login/login-page';
import RegisterPage from '../pages/register/register-page';
import NotificationSettingsPage from '../pages/notification-settings/notification-settings-page';
import OfflineDataPage from '../pages/offline-data/offline-data-page';

const routes = {
  '/': new HomePage(),
  '/about': new AboutPage(),
  '/add': new AddStoryPage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
  '/notifications': new NotificationSettingsPage(),
  '/offline-data': new OfflineDataPage(),
};

export default routes;

