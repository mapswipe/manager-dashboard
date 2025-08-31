import SmartLink from '#base/components/SmartLink';
import routes from '#base/configs/routes';
import PageLayout from '#components/PageLayout';

import ManagerList from './ManagerList';
import OrganizationList from './OrganizationList';

interface Props {
    className?: string;
}

function Home(props: Props) {
    const { className } = props;

    return (
        <PageLayout
            className={className}
            heading="MapSwipe Manager Dashboard"
            headerDescription={(
                <>
                    <div>
                        You can set up a new project by setting up project draft through
                        &nbsp;
                        <SmartLink
                            route={routes.newProject}
                            spacing="none"
                        >
                            New Project
                        </SmartLink>
                        &nbsp;
                        page.
                    </div>
                    <div>
                        You may find some of the useful stuff below.
                    </div>
                </>
            )}
        >
            <OrganizationList />
            <ManagerList />
        </PageLayout>
    );
}

export default Home;
