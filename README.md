# Kontent.ai Webhook Manager

A comprehensive custom app for managing, testing, and debugging webhooks in Kontent.ai projects. This application provides a user-friendly interface for webhook operations that would otherwise require complex API calls or manual configuration.

## 🚀 Features

### Core Webhook Management
- **Create & Configure**: Build webhooks with visual forms
- **Edit & Update**: Modify existing webhook configurations
- **Delete**: Remove webhooks with confirmation
- **Bulk Operations**: Manage multiple webhooks efficiently

### Testing & Debugging
- **Real-time Testing**: Test webhooks instantly with one-click testing
- **Response Monitoring**: View detailed delivery results and status codes
- **Performance Metrics**: Track response times and success rates
- **Delivery Logs**: Historical view of all webhook attempts

### Advanced Features
- **Trigger Management**: Configure multiple event triggers per webhook
- **Custom Headers**: Add authentication and custom headers
- **Environment Support**: Switch between different Kontent.ai environments
- **Status Monitoring**: Visual indicators for webhook health

### User Experience
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS
- **Real-time Updates**: Live status updates and notifications
- **Search & Filter**: Find webhooks quickly with advanced filtering
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **State Management**: React Context + useReducer
- **Routing**: React Router DOM
- **Kontent.ai Integration**: Custom App SDK + Management API v2

## 📦 Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Kontent.ai project with Management API enabled
- Custom App configured in your Kontent.ai environment

### Setup
1. Clone the repository:
```bash
git clone <repository-url>
cd kontent-webhook-manager
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## 🔧 Configuration

### Kontent.ai Setup
1. Enable Management API in your Kontent.ai environment
2. Create a Management API key in Project Settings → API Keys
3. Note your Environment ID from the environment settings
4. **Configure Custom App** in Environment Settings → Custom Apps:
   - Set the hosted code URL to your deployed app
   - Configure roles that can access the app
   - Add any JSON parameters for app configuration
5. The app will automatically detect your environment and user context

### Environment Variables
**Note**: When deployed as a Custom App, the app automatically detects your environment context through the Custom App SDK. No environment variables are needed for basic functionality.

For development/testing, you can create a `.env` file:
```env
VITE_KONTENT_ENVIRONMENT_ID=your_environment_id
VITE_KONTENT_API_KEY=your_management_api_key
VITE_KONTENT_PROJECT_ID=your_project_id
```

## 📱 Usage

### Dashboard
- Overview of webhook performance and statistics
- Quick access to recent webhooks
- Performance metrics and health indicators

### Webhooks List
- View all configured webhooks
- Search and filter by status
- Quick actions (test, edit, delete)
- Status indicators and delivery statistics

### Webhook Creation/Editing
- Visual form builder for webhook configuration
- Trigger selection with descriptions
- Custom header management
- URL validation and testing

### Webhook Details
- Comprehensive webhook information
- Real-time testing capabilities
- Delivery history and logs
- Configuration overview

### Settings
- Kontent.ai connection configuration
- API key management
- Application preferences
- Import/export functionality

## 🔌 API Integration

### Custom App SDK
The app uses the [Kontent.ai Custom App SDK](https://kontent.ai/learn/docs/custom-apps#a-use-custom-app-sdk-for-extra-context) to automatically detect:
- **Environment ID** - for API requests
- **User Information** - ID, email, and roles for access control
- **App Configuration** - JSON parameters from Custom App settings
- **Context** - information about where the app runs

### Management API v2
The app integrates with Kontent.ai's Management API v2 for webhook operations:

- **List Webhooks**: `GET /projects/{environment_id}/webhooks`
- **Create Webhook**: `POST /projects/{environment_id}/webhooks`
- **Update Webhook**: `PUT /projects/{environment_id}/webhooks/{id}`
- **Delete Webhook**: `DELETE /projects/{environment_id}/webhooks/{id}`

## 🎯 Supported Webhook Triggers

- Content item variant changes (created, updated, deleted)
- Workflow step changes
- Publishing/unpublishing events
- Asset operations (created, updated, deleted)

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy as Custom App
1. Build the application
2. Upload the `dist` folder to your web server
3. Configure the app in Kontent.ai Custom Apps
4. Set the app URL to your deployed application

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔒 Security Considerations

- API keys are stored securely and never exposed in the UI
- All API calls use HTTPS
- Input validation and sanitization
- Rate limiting support
- Environment isolation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Kontent.ai Webhook API](https://kontent.ai/learn/docs/apis/openapi/management-api-v2/#tag/Webhooks)
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Community**: Join the Kontent.ai community for discussions

## 🔮 Roadmap

- [ ] Real-time webhook delivery monitoring
- [ ] Advanced analytics and reporting
- [ ] Webhook templates and presets
- [ ] Integration with external monitoring services
- [ ] Multi-project support
- [ ] Advanced retry logic and dead letter queues
- [ ] Webhook payload validation
- [ ] Scheduled webhook testing
- [ ] Team collaboration features
- [ ] Audit logging and compliance

## 📊 Performance

- Optimized React rendering with proper memoization
- Efficient state management with Context API
- Lazy loading for better initial load times
- Responsive design for all device sizes
- Minimal bundle size with tree shaking

---

Built with ❤️ for the Kontent.ai community
