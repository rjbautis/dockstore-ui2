import { Component } from '@angular/core';
import { CommunicatorService } from '../../shared/communicator.service';
import { DockstoreService } from '../../shared/dockstore.service';
import { ImageProviderService } from '../../shared/image-provider.service';

import { ListService } from '../../shared/list.service';
import { ProviderService } from '../../shared/provider.service';

import { ToolLister } from '../../shared/tool-lister';

import { ListContainersService } from './list.service';

@Component({
  selector: 'app-list-containers',
  templateUrl: './list.component.html'
})
export class ListContainersComponent extends ToolLister {

  // TODO: make an API endpoint to retrieve only the necessary properties for the containers table
  // name, author, path, registry, gitUrl

  dtOptions = {
    columnDefs: [
      {
        orderable: false,
        targets: [ 2, 3 ]
      }
    ]
  };


  constructor(private listContainersService: ListContainersService,
              private communicatorService: CommunicatorService,
              private dockstoreService: DockstoreService,
              private imageProviderService: ImageProviderService,
              listService: ListService,
              providerService: ProviderService) {

    super(listService, providerService, 'containers');
  }

  sendToolInfo(tool) {
    this.communicatorService.setObj(tool);
  }

  getFilteredDockerPullCmd(path: string): string {
    return this.listContainersService.getDockerPullCmd(path);
  }

  initToolLister(): void {
    this.publishedTools = this.publishedTools.map(tool =>
      this.imageProviderService.setUpImageProvider(tool)
    );
  }

  getVerified(tool) {
    return this.dockstoreService.getVersionVerified(tool.tags);
  }


}
