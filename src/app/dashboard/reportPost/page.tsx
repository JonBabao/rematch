import CreatePost from '../../components/CreatePost';
import MainLayout from '../../components/layouts/MainLayout'

export default function HomePage() {
    return(
        <MainLayout>
            <CreatePost />
        </MainLayout>
    );
}