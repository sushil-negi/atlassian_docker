
# Pull base image.
FROM java:8-jre

ENV JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/jre
ENV JAVA_OPTS="-Xms2048m -Xmx2048m"
ENV JIRA_HOME="/home/ubuntu/jira_home/"

# Downloading confluence artifact form ATB Nexus and unzipping
RUN mkdir nexus_artifact
RUN mkdir jira-installation
ADD http://54.175.158.124:8081/repository/jira/atlassian-jira-software-7.3.4.zip /nexus_artifact/atlassian-jira-software-7.3.4.zip
RUN unzip /nexus_artifact/atlassian-jira-software-7.3.4.zip -d /jira-installation
RUN mkdir -p /home/ubuntu/jira_home;

# Removing artifact
RUN rm -rf /nexus_artifact/;

# Removing pre existing config files
RUN rm -rf /jira-installation/atlassian-jira-software-7.3.4-standalone/conf/server.xml
RUN rm -rf /jira-installation/atlassian-jira-software-7.3.4-standalone/bin/check-java.sh

# Adding config files
ADD server.xml /jira-installation/atlassian-jira-software-7.3.4-standalone/conf/server.xml
ADD check-java.sh /jira-installation/atlassian-jira-software-7.3.4-standalone/bin/check-java.sh
ADD dbconfig.xml /home/ubuntu/jira_home/dbconfig.xml

# Provide execution permission
RUN chmod +x /jira-installation/atlassian-jira-software-7.3.4-standalone/bin/start-jira.sh
RUN chmod +x /jira-installation/atlassian-jira-software-7.3.4-standalone/bin/check-java.sh
RUN chmod +x /jira-installation/atlassian-jira-software-7.3.4-standalone/bin/catalina.sh
RUN chmod 755 /jira-installation/atlassian-jira-software-7.3.4-standalone/bin/start-jira.sh
RUN /usr/sbin/useradd --create-home --comment "Account for running JIRA" --shell /bin/bash jira

EXPOSE 8080

# Start Jira
CMD ./jira-installation/atlassian-jira-software-7.3.4-standalone/bin/startup.sh && tail -f ./jira-installation/atlassian-jira-software-7.3.4-standalone/logs/catalina.out
