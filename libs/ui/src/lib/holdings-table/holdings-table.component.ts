import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ASSET_SUB_CLASS_EMERGENCY_FUND } from '@ghostfolio/common/config';
import { PortfolioPosition, UniqueAsset } from '@ghostfolio/common/interfaces';
import { AssetClass, Order as OrderModel } from '@prisma/client';
import { Subject, Subscription } from 'rxjs';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'gf-holdings-table',
  styleUrls: ['./holdings-table.component.scss'],
  templateUrl: './holdings-table.component.html'
})
export class HoldingsTableComponent implements OnChanges, OnDestroy, OnInit {
  @Input() baseCurrency: string;
  @Input() deviceType: string;
  @Input() hasPermissionToCreateActivity: boolean;
  @Input() hasPermissionToShowValues = true;
  @Input() locale: string;
  @Input() pageSize = Number.MAX_SAFE_INTEGER;
  @Input() positions: PortfolioPosition[];

  @Output() transactionDeleted = new EventEmitter<string>();
  @Output() transactionToUpdate = new EventEmitter<OrderModel>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  public dataSource: MatTableDataSource<PortfolioPosition> =
    new MatTableDataSource();
  public displayedColumns = [];
  public ignoreAssetSubClasses = [
    AssetClass.CASH.toString(),
    ASSET_SUB_CLASS_EMERGENCY_FUND
  ];
  public isLoading = true;
  public routeQueryParams: Subscription;

  private unsubscribeSubject = new Subject<void>();

  public constructor(private router: Router) {}

  public ngOnInit() {}

  public ngOnChanges() {
    this.displayedColumns = ['icon', 'nameWithSymbol', 'dateOfFirstActivity'];

    if (this.hasPermissionToShowValues) {
      this.displayedColumns.push('value');
    }

    this.displayedColumns.push('allocationCurrent');
    this.displayedColumns.push('performance');

    this.isLoading = true;

    if (this.positions) {
      this.dataSource = new MatTableDataSource(this.positions);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      this.isLoading = false;
    }
  }

  public onOpenPositionDialog({ dataSource, symbol }: UniqueAsset): void {
    this.router.navigate([], {
      queryParams: { dataSource, symbol, positionDetailDialog: true }
    });
  }

  public onShowAllPositions() {
    this.pageSize = Number.MAX_SAFE_INTEGER;

    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
    });
  }

  public ngOnDestroy() {
    this.unsubscribeSubject.next();
    this.unsubscribeSubject.complete();
  }
}
